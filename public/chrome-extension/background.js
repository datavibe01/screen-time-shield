// Focus Time Tracker - Background Service Worker

let activeTabId = null;
let activeUrl = null;
let startTime = null;
let totalSeconds = 0;
let isTracking = false;

// Default settings
const DEFAULT_SETTINGS = {
  reminderInterval: 15, // minutes
  customInterval: null,
  enableNotifications: true,
  enablePageInterrupt: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    settings: DEFAULT_SETTINGS,
    todayStats: {},
    totalTimeToday: 0,
    lastResetDate: new Date().toDateString()
  });
  updateBadge(0);
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

// Track URL changes within same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    handleTabChange(tab);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    pauseTracking();
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        handleTabChange(tabs[0]);
      }
    });
  }
});

function handleTabChange(tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    pauseTracking();
    return;
  }

  // Save time for previous site
  if (isTracking && activeUrl) {
    saveTimeForSite(activeUrl, getElapsedSeconds());
  }

  // Start tracking new site
  activeTabId = tab.id;
  activeUrl = new URL(tab.url).hostname;
  startTime = Date.now();
  isTracking = true;
}

function pauseTracking() {
  if (isTracking && activeUrl) {
    saveTimeForSite(activeUrl, getElapsedSeconds());
  }
  isTracking = false;
  startTime = null;
}

function getElapsedSeconds() {
  if (!startTime) return 0;
  return Math.floor((Date.now() - startTime) / 1000);
}

async function saveTimeForSite(hostname, seconds) {
  const data = await chrome.storage.local.get(['todayStats', 'totalTimeToday', 'lastResetDate']);
  
  // Reset if new day
  const today = new Date().toDateString();
  if (data.lastResetDate !== today) {
    data.todayStats = {};
    data.totalTimeToday = 0;
    data.lastResetDate = today;
  }

  // Update stats
  const stats = data.todayStats || {};
  stats[hostname] = (stats[hostname] || 0) + seconds;
  const totalTime = (data.totalTimeToday || 0) + seconds;

  await chrome.storage.local.set({
    todayStats: stats,
    totalTimeToday: totalTime,
    lastResetDate: today
  });

  totalSeconds = totalTime;
  updateBadge(totalTime);
  checkReminder(totalTime);
}

function updateBadge(seconds) {
  const minutes = Math.floor(seconds / 60);
  let text = '';
  
  if (minutes < 60) {
    text = `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    text = mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  }
  
  // Color changes based on time spent
  let color = '#10B981'; // Green for < 30 min
  if (minutes >= 60) {
    color = '#EF4444'; // Red for >= 1 hour
  } else if (minutes >= 30) {
    color = '#F59E0B'; // Orange for >= 30 min
  }

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

async function checkReminder(totalSeconds) {
  const data = await chrome.storage.local.get(['settings', 'lastReminderTime']);
  const settings = data.settings || DEFAULT_SETTINGS;
  const interval = (settings.customInterval || settings.reminderInterval) * 60; // Convert to seconds
  
  const lastReminder = data.lastReminderTime || 0;
  const timeSinceReminder = totalSeconds - lastReminder;

  if (timeSinceReminder >= interval) {
    await chrome.storage.local.set({ lastReminderTime: totalSeconds });
    
    // Send notification
    if (settings.enableNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '⏰ Time Check!',
        message: `You've been browsing for ${formatTime(totalSeconds)}. Consider taking a break!`,
        priority: 2
      });
    }

    // Send message to content script for page interrupt
    if (settings.enablePageInterrupt && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        type: 'SHOW_REMINDER',
        totalTime: totalSeconds,
        formattedTime: formatTime(totalSeconds)
      }).catch(() => {});
    }
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
}

// Update badge every second
setInterval(async () => {
  if (isTracking) {
    const data = await chrome.storage.local.get(['totalTimeToday']);
    const currentTotal = (data.totalTimeToday || 0) + getElapsedSeconds();
    updateBadge(currentTotal);
  }
}, 1000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['todayStats', 'totalTimeToday', 'settings']).then(data => {
      const currentTotal = isTracking 
        ? (data.totalTimeToday || 0) + getElapsedSeconds()
        : (data.totalTimeToday || 0);
      
      sendResponse({
        stats: data.todayStats || {},
        totalTime: currentTotal,
        settings: data.settings || DEFAULT_SETTINGS,
        currentSite: activeUrl
      });
    });
    return true;
  }
  
  if (message.type === 'UPDATE_SETTINGS') {
    chrome.storage.local.set({ settings: message.settings }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'RESET_TODAY') {
    chrome.storage.local.set({
      todayStats: {},
      totalTimeToday: 0,
      lastReminderTime: 0
    }).then(() => {
      totalSeconds = 0;
      updateBadge(0);
      sendResponse({ success: true });
    });
    return true;
  }
});

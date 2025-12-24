// DOM Elements
const totalTimeEl = document.getElementById('totalTime');
const progressBar = document.getElementById('progressBar');
const sitesListEl = document.getElementById('sitesList');
const sitesVisitedEl = document.getElementById('sitesVisited');
const avgPerSiteEl = document.getElementById('avgPerSite');
const currentSiteEl = document.getElementById('currentSite');
const reminderIntervalEl = document.getElementById('reminderInterval');
const customIntervalRowEl = document.getElementById('customIntervalRow');
const customIntervalEl = document.getElementById('customInterval');
const enableNotificationsEl = document.getElementById('enableNotifications');
const enablePageInterruptEl = document.getElementById('enablePageInterrupt');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// Format time helper
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Load and display stats
function loadStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
    if (!response) return;

    const { stats, totalTime, settings, currentSite } = response;

    // Update total time
    totalTimeEl.textContent = formatTime(totalTime);
    
    // Update progress bar (based on 8 hours goal)
    const progressPercent = Math.min((totalTime / (8 * 3600)) * 100, 100);
    progressBar.style.width = `${progressPercent}%`;

    // Update current site
    currentSiteEl.textContent = currentSite || '-';

    // Sort sites by time
    const sortedSites = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Update stats
    sitesVisitedEl.textContent = Object.keys(stats).length;
    
    const avgTime = Object.keys(stats).length > 0 
      ? Math.floor(totalTime / Object.keys(stats).length)
      : 0;
    avgPerSiteEl.textContent = formatMinutes(avgTime);

    // Render sites list
    if (sortedSites.length > 0) {
      sitesListEl.innerHTML = sortedSites.map(([site, time]) => `
        <div class="site-item">
          <span class="site-name">${site}</span>
          <span class="site-time">${formatMinutes(time)}</span>
        </div>
      `).join('');
    } else {
      sitesListEl.innerHTML = '<div class="empty-state">No data yet. Start browsing!</div>';
    }

    // Load settings
    if (settings) {
      if (settings.customInterval) {
        reminderIntervalEl.value = 'custom';
        customIntervalEl.value = settings.customInterval;
        customIntervalRowEl.style.display = 'flex';
      } else {
        reminderIntervalEl.value = settings.reminderInterval.toString();
      }
      enableNotificationsEl.checked = settings.enableNotifications;
      enablePageInterruptEl.checked = settings.enablePageInterrupt;
    }
  });
}

// Handle reminder interval change
reminderIntervalEl.addEventListener('change', () => {
  if (reminderIntervalEl.value === 'custom') {
    customIntervalRowEl.style.display = 'flex';
  } else {
    customIntervalRowEl.style.display = 'none';
    customIntervalEl.value = '';
  }
});

// Save settings
saveBtn.addEventListener('click', () => {
  const settings = {
    reminderInterval: parseInt(reminderIntervalEl.value) || 15,
    customInterval: reminderIntervalEl.value === 'custom' ? parseInt(customIntervalEl.value) : null,
    enableNotifications: enableNotificationsEl.checked,
    enablePageInterrupt: enablePageInterruptEl.checked
  };

  chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings }, (response) => {
    if (response?.success) {
      showToast('Settings saved!');
    }
  });
});

// Reset today's stats
resetBtn.addEventListener('click', () => {
  if (confirm('Reset all time tracking for today?')) {
    chrome.runtime.sendMessage({ type: 'RESET_TODAY' }, (response) => {
      if (response?.success) {
        loadStats();
        showToast('Stats reset!');
      }
    });
  }
});

// Toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Initial load
loadStats();

// Refresh stats every second
setInterval(loadStats, 1000);

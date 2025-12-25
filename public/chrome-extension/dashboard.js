// DOM Elements
const totalTimeTodayEl = document.getElementById('totalTimeToday');
const dailyProgressEl = document.getElementById('dailyProgress');
const sitesVisitedEl = document.getElementById('sitesVisited');
const avgPerSiteEl = document.getElementById('avgPerSite');
const remindersShownEl = document.getElementById('remindersShown');
const currentDateEl = document.getElementById('currentDate');
const pieChartEl = document.getElementById('pieChart');
const chartDetailsEl = document.getElementById('chartDetails');
const chartLegendEl = document.getElementById('chartLegend');
const hourlyChartEl = document.getElementById('hourlyChart');
const hourlyLabelsEl = document.getElementById('hourlyLabels');
const sitesTableBodyEl = document.getElementById('sitesTableBody');
const searchInputEl = document.getElementById('searchInput');
const reminderIntervalEl = document.getElementById('reminderInterval');
const customIntervalRowEl = document.getElementById('customIntervalRow');
const customIntervalEl = document.getElementById('customInterval');
const enableNotificationsEl = document.getElementById('enableNotifications');
const enablePageInterruptEl = document.getElementById('enablePageInterrupt');
const saveSettingsBtnEl = document.getElementById('saveSettingsBtn');
const resetTodayBtnEl = document.getElementById('resetTodayBtn');
const resetAllBtnEl = document.getElementById('resetAllBtn');
const exportBtnEl = document.getElementById('exportBtn');

// Chart colors
const chartColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899',
  '#06b6d4', '#eab308', '#ef4444', '#84cc16', '#6366f1'
];

// Store data globally
let globalStats = {};
let globalTotalTime = 0;

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

// Set current date
function setCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Load and display stats
function loadStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
    if (!response) return;

    const { stats, totalTime, settings, hourlyData, remindersCount } = response;
    globalStats = stats;
    globalTotalTime = totalTime;

    // Update main stats
    totalTimeTodayEl.textContent = formatTime(totalTime);
    
    // Update progress bar (based on 8 hours goal)
    const progressPercent = Math.min((totalTime / (8 * 3600)) * 100, 100);
    dailyProgressEl.style.width = `${progressPercent}%`;

    // Update sites visited
    sitesVisitedEl.textContent = Object.keys(stats).length;
    
    // Update average per site
    const avgTime = Object.keys(stats).length > 0 
      ? Math.floor(totalTime / Object.keys(stats).length)
      : 0;
    avgPerSiteEl.textContent = formatMinutes(avgTime);

    // Update reminders count
    remindersShownEl.textContent = remindersCount || 0;

    // Render pie chart
    renderPieChart(stats, totalTime);

    // Render hourly chart
    renderHourlyChart(hourlyData || {});

    // Render sites table
    renderSitesTable(stats, totalTime);

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

// Render pie chart
function renderPieChart(stats, totalTime) {
  const sortedSites = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedSites.length === 0) {
    pieChartEl.style.background = '#334155';
    chartDetailsEl.innerHTML = '<div class="empty-state"><p>No data yet</p></div>';
    chartLegendEl.innerHTML = '';
    return;
  }

  // Calculate percentages and create gradient
  let gradientParts = [];
  let currentAngle = 0;
  let detailsHtml = '';
  let legendHtml = '';

  sortedSites.forEach(([site, time], index) => {
    const percent = totalTime > 0 ? (time / totalTime) * 100 : 0;
    const color = chartColors[index % chartColors.length];
    const startAngle = currentAngle;
    currentAngle += percent * 3.6; // Convert to degrees

    gradientParts.push(`${color} ${startAngle}deg ${currentAngle}deg`);

    detailsHtml += `
      <div class="detail-item">
        <div class="detail-color" style="background: ${color}"></div>
        <div class="detail-info">
          <div class="detail-name">${site}</div>
          <div class="detail-time">${formatMinutes(time)}</div>
        </div>
        <div class="detail-percent">${percent.toFixed(1)}%</div>
      </div>
    `;

    legendHtml += `
      <div class="legend-item">
        <div class="legend-color" style="background: ${color}"></div>
        <span>${site}</span>
      </div>
    `;
  });

  // Handle remaining sites
  const otherSites = Object.entries(stats).slice(5);
  if (otherSites.length > 0) {
    const otherTime = otherSites.reduce((acc, [_, time]) => acc + time, 0);
    const otherPercent = totalTime > 0 ? (otherTime / totalTime) * 100 : 0;
    gradientParts.push(`#475569 ${currentAngle}deg 360deg`);
    
    detailsHtml += `
      <div class="detail-item">
        <div class="detail-color" style="background: #475569"></div>
        <div class="detail-info">
          <div class="detail-name">Other (${otherSites.length} sites)</div>
          <div class="detail-time">${formatMinutes(otherTime)}</div>
        </div>
        <div class="detail-percent">${otherPercent.toFixed(1)}%</div>
      </div>
    `;
  }

  pieChartEl.style.background = `conic-gradient(${gradientParts.join(', ')})`;
  chartDetailsEl.innerHTML = detailsHtml;
  chartLegendEl.innerHTML = legendHtml;
}

// Render hourly chart
function renderHourlyChart(hourlyData) {
  const hours = [];
  const labels = [];
  
  // Get current hour
  const currentHour = new Date().getHours();
  
  // Show last 12 hours
  for (let i = 11; i >= 0; i--) {
    const hour = (currentHour - i + 24) % 24;
    hours.push(hour);
    labels.push(hour.toString().padStart(2, '0') + ':00');
  }

  // Find max value for scaling
  const maxTime = Math.max(...hours.map(h => hourlyData[h] || 0), 1);

  // Generate bars
  hourlyChartEl.innerHTML = hours.map(hour => {
    const time = hourlyData[hour] || 0;
    const heightPercent = (time / maxTime) * 100;
    return `<div class="bar" style="height: ${Math.max(heightPercent, 2)}%" data-time="${formatMinutes(time)}"></div>`;
  }).join('');

  // Generate labels
  hourlyLabelsEl.innerHTML = labels.map(label => `<span>${label}</span>`).join('');
}

// Render sites table
function renderSitesTable(stats, totalTime, filter = '') {
  let sortedSites = Object.entries(stats)
    .sort((a, b) => b[1] - a[1]);

  if (filter) {
    sortedSites = sortedSites.filter(([site]) => 
      site.toLowerCase().includes(filter.toLowerCase())
    );
  }

  if (sortedSites.length === 0) {
    sitesTableBodyEl.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8"/>
        </svg>
        <p>${filter ? 'No matching sites found' : 'No browsing data yet. Start browsing!'}</p>
      </div>
    `;
    return;
  }

  sitesTableBodyEl.innerHTML = sortedSites.map(([site, time], index) => {
    const percent = totalTime > 0 ? (time / totalTime) * 100 : 0;
    return `
      <div class="table-row">
        <span class="col-rank">${index + 1}</span>
        <span class="col-site">${site}</span>
        <span class="col-time">${formatMinutes(time)}</span>
        <span class="col-percent">${percent.toFixed(1)}%</span>
        <div class="col-bar">
          <div class="bar-fill" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Search handler
searchInputEl.addEventListener('input', (e) => {
  renderSitesTable(globalStats, globalTotalTime, e.target.value);
});

// Reminder interval change handler
reminderIntervalEl.addEventListener('change', () => {
  if (reminderIntervalEl.value === 'custom') {
    customIntervalRowEl.style.display = 'flex';
  } else {
    customIntervalRowEl.style.display = 'none';
    customIntervalEl.value = '';
  }
});

// Save settings
saveSettingsBtnEl.addEventListener('click', () => {
  const settings = {
    reminderInterval: parseInt(reminderIntervalEl.value) || 15,
    customInterval: reminderIntervalEl.value === 'custom' ? parseInt(customIntervalEl.value) : null,
    enableNotifications: enableNotificationsEl.checked,
    enablePageInterrupt: enablePageInterruptEl.checked
  };

  chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings }, (response) => {
    if (response?.success) {
      showToast('Settings saved successfully!');
    }
  });
});

// Reset today
resetTodayBtnEl.addEventListener('click', () => {
  if (confirm('Reset all time tracking for today? This cannot be undone.')) {
    chrome.runtime.sendMessage({ type: 'RESET_TODAY' }, (response) => {
      if (response?.success) {
        loadStats();
        showToast('Today\'s stats have been reset!');
      }
    });
  }
});

// Reset all data
resetAllBtnEl.addEventListener('click', () => {
  if (confirm('Reset ALL tracking data? This will clear your entire history and cannot be undone.')) {
    chrome.runtime.sendMessage({ type: 'RESET_ALL' }, (response) => {
      if (response?.success) {
        loadStats();
        showToast('All data has been reset!');
      }
    });
  }
});

// Export data
exportBtnEl.addEventListener('click', () => {
  chrome.storage.local.get(null, (data) => {
    const exportData = JSON.stringify(data, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  });
});

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize
setCurrentDate();
loadStats();

// Refresh stats every second
setInterval(loadStats, 1000);

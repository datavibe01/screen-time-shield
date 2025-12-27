// Content script for full-screen dark overlay reminders

let overlayVisible = false;

// Listen for reminder messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_REMINDER') {
    showReminderOverlay(message.formattedTime, message.intervalMinutes);
  }
});

function showReminderOverlay(timeSpent, intervalMinutes) {
  if (overlayVisible) return;
  overlayVisible = true;

  // Create full-screen dark overlay
  const overlay = document.createElement('div');
  overlay.id = 'focus-tracker-overlay';
  overlay.innerHTML = `
    <div class="focus-tracker-fullscreen">
      <div class="focus-tracker-time-icon">⏰</div>
      <h1 class="focus-tracker-main-text">${intervalMinutes || 15} Minutes Ended</h1>
      <p class="focus-tracker-sub-text">You've been browsing for <strong>${timeSpent}</strong></p>
      <p class="focus-tracker-hint">Take a break to rest your eyes and stretch</p>
      <div class="focus-tracker-actions">
        <button class="focus-tracker-btn focus-tracker-btn-break">
          <span>🧘</span> Take a Break
        </button>
        <button class="focus-tracker-btn focus-tracker-btn-continue">
          <span>→</span> Continue Browsing
        </button>
      </div>
      <p class="focus-tracker-dismiss-hint">Press ESC or click anywhere to dismiss</p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add animation
  requestAnimationFrame(() => {
    overlay.classList.add('focus-tracker-visible');
  });

  // Handle button clicks
  const breakBtn = overlay.querySelector('.focus-tracker-btn-break');
  const continueBtn = overlay.querySelector('.focus-tracker-btn-continue');

  breakBtn.addEventListener('click', () => {
    closeOverlay(overlay);
    window.open('https://www.calm.com/breathe', '_blank');
  });

  continueBtn.addEventListener('click', () => {
    closeOverlay(overlay);
  });

  // Close on escape key
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeOverlay(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  });

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay(overlay);
    }
  });
}

function closeOverlay(overlay) {
  overlay.classList.remove('focus-tracker-visible');
  setTimeout(() => {
    overlay.remove();
    overlayVisible = false;
  }, 300);
}

// Content script for page overlay reminders

let overlayVisible = false;

// Listen for reminder messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_REMINDER') {
    showReminderOverlay(message.formattedTime);
  }
});

function showReminderOverlay(timeSpent) {
  if (overlayVisible) return;
  overlayVisible = true;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'focus-tracker-overlay';
  overlay.innerHTML = `
    <div class="focus-tracker-modal">
      <div class="focus-tracker-icon">⏰</div>
      <h2>Time Check!</h2>
      <p>You've been browsing for <strong>${timeSpent}</strong></p>
      <p class="focus-tracker-subtitle">Consider taking a short break to rest your eyes and stretch.</p>
      <div class="focus-tracker-buttons">
        <button class="focus-tracker-btn focus-tracker-btn-break">Take a Break</button>
        <button class="focus-tracker-btn focus-tracker-btn-continue">Continue Browsing</button>
      </div>
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
    // Open a relaxing break page
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

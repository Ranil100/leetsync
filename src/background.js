// background.js — Service Worker
// All GitHub pushing is now done directly in content.js
// This service worker only handles Chrome notifications (which require background context)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    const { ok, title, runtime, repo } = message;
    if (ok) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '✅ LeetPush — Synced!',
        message: `${title} pushed to ${repo} (${runtime})`
      });
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠️ LeetPush — Push Failed',
        message: `Could not push ${title}. Check console for details.`
      });
    }
  }
});

console.log('[LeetPush BG] Service worker ready');

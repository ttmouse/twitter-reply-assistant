// Background Service Worker
// This runs in the background and handles extension lifecycle events

console.log('Twitter Reply Assistant: Background service worker started');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);
  // Handle messages here
  sendResponse({ status: 'ok' });
  return true; // Keep channel open for async response
});

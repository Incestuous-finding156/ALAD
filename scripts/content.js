// scripts/content.js — Minimal content script (no video muting needed)
// Audio routing is handled entirely in the offscreen document.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Reserved for future use (e.g. YouTube time sync)
});

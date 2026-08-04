let currentStatus = 'Idle';
let offscreenCreating = null;
let activeStreamId = null;
chrome.storage.local.get(['ladStatus'], (res) => {
  if (res.ladStatus) currentStatus = res.ladStatus;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ status: currentStatus });
    return true;
  }

  if (message.type === 'TOGGLE_DUBBING') {
    if (message.enabled) {
      startDubbing();
    } else {
      stopDubbing();
    }
  }

  if (message.type === 'SETTINGS_CHANGED') {
    chrome.storage.sync.get(['apiKey', 'targetLang'], (res) => {
      chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: res
      }).catch(() => {});
    });
  }


});

async function setStatus(status) {
  currentStatus = status;
  chrome.storage.local.set({ ladStatus: status });
  chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', status }).catch(() => {});
}

async function setupOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('scripts/offscreen.html');
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (offscreenCreating) {
    await offscreenCreating;
  } else {
    offscreenCreating = chrome.offscreen.createDocument({
      url: 'scripts/offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Capturing tab audio for translation'
    });
    await offscreenCreating;
    offscreenCreating = null;
  }
}

// Remove global currentSession variable since Service Worker can reset
async function startDubbing() {
  try {
    setStatus('Starting...');
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');

    let domain = 'unknown';
    try {
      if (tab.url) {
        domain = new URL(tab.url).hostname.replace(/^www\./, '');
      }
    } catch(e) {}

    // Make sure we have setup the offscreen document
    await setupOffscreenDocument();

    // Get stream ID for the active tab
    activeStreamId = await new Promise((resolve, reject) => {
      chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        resolve(streamId);
      });
    });

    // Send stream ID and settings to offscreen document
    chrome.storage.sync.get(['apiKey', 'targetLang'], (res) => {
      const session = {
        id: crypto.randomUUID(),
        startTime: Date.now(),
        lang: res.targetLang || 'fa',
        domain: domain
      };
      // Persist the current session state
      chrome.storage.local.set({ lad_current_session: session });

      chrome.runtime.sendMessage({
        type: 'START_CAPTURE',
        streamId: activeStreamId,
        settings: res
      }).catch(() => {});
    });

    // Send message to content script to mute the video
    chrome.tabs.sendMessage(tab.id, { type: 'MUTE_VIDEO' }).catch(() => {});

    setStatus('Listening...');
  } catch (error) {
    console.error('Error starting dubbing:', error);
    setStatus('Error: ' + error.message);
  }
}

async function stopDubbing() {
  setStatus('Idle');
  
  chrome.storage.local.get(['lad_current_session', 'lad_sessions'], (storage) => {
    const session = storage.lad_current_session;
    if (session) {
      const durationSec = Math.floor((Date.now() - session.startTime) / 1000);
      if (durationSec >= 3) {
        session.durationSec = durationSec;
        const sessions = storage.lad_sessions || [];
        sessions.unshift(session);
        if (sessions.length > 2000) sessions.length = 2000;
        chrome.storage.local.set({ lad_sessions: sessions, lad_current_session: null });
      } else {
        chrome.storage.local.remove('lad_current_session');
      }
    }
  });

  // Stop capture in offscreen document
  chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' }).catch(() => {});

  // Send message to content script to unmute the video
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { type: 'UNMUTE_VIDEO' }).catch(() => {});
  }
}

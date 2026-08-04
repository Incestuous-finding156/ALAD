// popup.js — LAD popup with 78 languages, timer, API key management

const LANGUAGES = [
  { code: 'af', label: 'Afrikaans' },
  { code: 'ak', label: 'Akan' },
  { code: 'sq', label: 'Albanian' },
  { code: 'am', label: 'Amharic' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hy', label: 'Armenian' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'eu', label: 'Basque' },
  { code: 'be', label: 'Belarusian' },
  { code: 'bn', label: 'Bengali' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'my', label: 'Burmese' },
  { code: 'ca', label: 'Catalan' },
  { code: 'zh-Hans', label: 'Chinese (Simplified)' },
  { code: 'zh-Hant', label: 'Chinese (Traditional)' },
  { code: 'hr', label: 'Croatian' },
  { code: 'cs', label: 'Czech' },
  { code: 'da', label: 'Danish' },
  { code: 'nl', label: 'Dutch' },
  { code: 'en', label: 'English' },
  { code: 'et', label: 'Estonian' },
  { code: 'fil', label: 'Filipino' },
  { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' },
  { code: 'gl', label: 'Galician' },
  { code: 'ka', label: 'Georgian' },
  { code: 'de', label: 'German' },
  { code: 'el', label: 'Greek' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ha', label: 'Hausa' },
  { code: 'he', label: 'Hebrew' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'is', label: 'Icelandic' },
  { code: 'id', label: 'Indonesian' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'jv', label: 'Javanese' },
  { code: 'kn', label: 'Kannada' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'km', label: 'Khmer' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'ko', label: 'Korean' },
  { code: 'lo', label: 'Lao' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'ms', label: 'Malay' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'ne', label: 'Nepali' },
  { code: 'no', label: 'Norwegian' },
  { code: 'fa', label: 'Persian' },
  { code: 'pl', label: 'Polish' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ro', label: 'Romanian' },
  { code: 'ru', label: 'Russian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'sd', label: 'Sindhi' },
  { code: 'si', label: 'Sinhala' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'es', label: 'Spanish' },
  { code: 'su', label: 'Sundanese' },
  { code: 'sw', label: 'Swahili' },
  { code: 'sv', label: 'Swedish' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'th', label: 'Thai' },
  { code: 'tr', label: 'Turkish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zu', label: 'Zulu' }
];

document.addEventListener('DOMContentLoaded', () => {
  const targetLangSelect = document.getElementById('targetLang');
  const toggleBtn = document.getElementById('toggleBtn');
  const statusRow = document.getElementById('statusRow');
  const statusText = document.getElementById('statusText');
  const timerEl = document.getElementById('timer');
  const apiKeyInput = document.getElementById('apiKey');
  const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
  const apiKeySection = document.getElementById('apiKeySection');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const clearKeyBtn = document.getElementById('clearKeyBtn');

  let isDubbing = false;
  let timerInterval = null;
  let timerSeconds = 0;

  // ── Populate language dropdown ──
  const customSelectContainer = document.getElementById('customSelectContainer');
  const customSelectLabel = document.getElementById('customSelectLabel');
  const customSelectOptions = document.getElementById('customSelectOptions');

  // Toggle custom dropdown
  customSelectContainer.addEventListener('click', () => {
    customSelectContainer.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!customSelectContainer.contains(e.target)) {
      customSelectContainer.classList.remove('open');
    }
  });

  function setLanguage(code, label) {
    targetLangSelect.value = code;
    customSelectLabel.textContent = label;
    // Trigger native change event if needed
    targetLangSelect.dispatchEvent(new Event('change'));
    
    // Update selected class
    Array.from(customSelectOptions.children).forEach(child => {
      if (child.dataset.value === code) child.classList.add('selected');
      else child.classList.remove('selected');
    });
  }

  LANGUAGES.forEach(lang => {
    // Hidden native select (for existing logic)
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.label;
    targetLangSelect.appendChild(opt);

    // Custom select options
    const customOpt = document.createElement('div');
    customOpt.className = 'custom-option';
    customOpt.dataset.value = lang.code;
    customOpt.textContent = lang.label;
    customOpt.addEventListener('click', () => {
      setLanguage(lang.code, lang.label);
    });
    customSelectOptions.appendChild(customOpt);
  });

  // ── Load saved settings ──
  chrome.storage.sync.get(['apiKey', 'targetLang', 'isDubbingEnabled'], (result) => {
    if (result.apiKey) apiKeyInput.value = result.apiKey;
    
    const initialCode = result.targetLang || 'fa';
    const initialLang = LANGUAGES.find(l => l.code === initialCode) || LANGUAGES.find(l => l.code === 'fa');
    
    targetLangSelect.value = initialCode;
    customSelectLabel.textContent = initialLang.label;
    
    Array.from(customSelectOptions.children).forEach(child => {
      if (child.dataset.value === initialCode) child.classList.add('selected');
    });
    if (result.isDubbingEnabled) {
      isDubbing = true;
      showDubbingState();
    }
  });

  // ── Toggle dubbing ──
  toggleBtn.addEventListener('click', () => {
    // Auto-save settings before starting
    const apiKey = apiKeyInput.value.trim();
    const targetLang = targetLangSelect.value;

    if (!isDubbing && !apiKey) {
      // Show API key section if no key
      apiKeySection.classList.remove('hidden');
      toggleKeyVisibility.textContent = 'Hide';
      apiKeyInput.focus();
      showError('Enter your API key first');
      return;
    }

    isDubbing = !isDubbing;

    // Save current settings
    chrome.storage.sync.set({ apiKey, targetLang, isDubbingEnabled: isDubbing });

    if (isDubbing) {
      chrome.runtime.sendMessage({ type: 'TOGGLE_DUBBING', enabled: true });
      showDubbingState();
    } else {
      chrome.runtime.sendMessage({ type: 'TOGGLE_DUBBING', enabled: false });
      showIdleState();
    }
  });

  // ── Language change while dubbing ──
  targetLangSelect.addEventListener('change', () => {
    const targetLang = targetLangSelect.value;
    chrome.storage.sync.set({ targetLang });
    if (isDubbing) {
      chrome.runtime.sendMessage({ type: 'TOGGLE_DUBBING', enabled: false });
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'TOGGLE_DUBBING', enabled: true });
      }, 500);
    }
  });

  // ── Usage stats link ──
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('stats/index.html') });
    });
  }

  // ── API Key visibility toggle ──
  toggleKeyVisibility.addEventListener('click', () => {
    const isHidden = apiKeySection.classList.contains('hidden');
    if (isHidden) {
      apiKeySection.classList.remove('hidden');
      toggleKeyVisibility.textContent = 'Hide';
    } else {
      apiKeySection.classList.add('hidden');
      toggleKeyVisibility.textContent = 'Show';
    }
  });

  // ── Save API key ──
  saveKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return;
    chrome.storage.sync.set({ apiKey }, () => {
      saveKeyBtn.textContent = 'Saved!';
      saveKeyBtn.classList.add('saved');
      setTimeout(() => {
        saveKeyBtn.textContent = 'Save';
        saveKeyBtn.classList.remove('saved');
      }, 1500);
      chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });
    });
  });

  // ── Clear API key ──
  clearKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    chrome.storage.sync.remove('apiKey');
    if (isDubbing) {
      isDubbing = false;
      chrome.storage.sync.set({ isDubbingEnabled: false });
      chrome.runtime.sendMessage({ type: 'TOGGLE_DUBBING', enabled: false });
      showIdleState();
    }
  });

  // ── Listen for status updates ──
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'STATUS_UPDATE') {
      if (message.status.includes('Error') || message.status.includes('Err')) {
        showError(message.status);
      } else if (message.status.includes('setupComplete')) {
        statusText.textContent = 'Dubbing';
        statusRow.classList.remove('status-error');
      } else if (message.status.includes('Playback started')) {
        statusText.textContent = 'Dubbing';
        statusRow.classList.remove('status-error');
      }
    }
  });

  // ── UI State functions ──
  function showDubbingState() {
    toggleBtn.textContent = 'Stop';
    toggleBtn.className = 'btn-stop';
    statusRow.classList.remove('hidden', 'status-error');
    statusText.textContent = 'Connecting...';
    startTimer();
  }

  function showIdleState() {
    toggleBtn.textContent = 'Start dubbing';
    toggleBtn.className = 'btn-start';
    statusRow.classList.add('hidden');
    stopTimer();
  }

  function showError(msg) {
    statusRow.classList.remove('hidden');
    statusRow.classList.add('status-error');
    statusText.textContent = msg;
  }

  // ── Timer ──
  function startTimer() {
    timerSeconds = 0;
    timerEl.textContent = '0:00';
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds++;
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerSeconds = 0;
  }

  // ── Check if already dubbing (e.g. popup was re-opened) ──
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (chrome.runtime.lastError) return;
    if (response && response.status && response.status !== 'Idle') {
      isDubbing = true;
      showDubbingState();
    }
  });
});

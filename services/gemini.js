// services/gemini.js — Rewritten to exactly match LivDub's working WebSocket protocol

const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const AUDIO_MIME = 'audio/pcm;rate=16000';

class GeminiService {
  constructor() {
    this.apiKey = '';
    this.targetLang = 'fa';
    this.ws = null;
    this.setupComplete = false;
    this.pendingAudio = [];
    this.onAudioData = null;   // callback(base64data, sampleRate)
    this.onError = null;
    this.onStatus = null;
  }

  updateSettings(settings) {
    if (settings.apiKey) this.apiKey = settings.apiKey;
    if (settings.targetLang) this.targetLang = settings.targetLang.split('-')[0];
  }

  connect() {
    if (!this.apiKey) {
      if (this.onError) this.onError(new Error('API Key is missing'));
      return;
    }
    if (this.ws) this.disconnect();

    const url = `${GEMINI_WS_URL}?key=${this.apiKey}`;
    this.ws = new WebSocket(url);
    this.setupComplete = false;
    this.pendingAudio = [];

    this.ws.addEventListener('open', () => {
      this._log('WS opened, sending setup...');
      this._sendSetup();
    });

    this.ws.addEventListener('message', async (event) => {
      try {
        const raw = typeof event.data === 'string'
          ? event.data
          : event.data instanceof Blob
            ? await event.data.text()
            : new TextDecoder().decode(event.data);
        
        const data = JSON.parse(raw);

        // Error from server
        if (data.error && data.error.message) {
          this._log('API Err: ' + data.error.message.substring(0, 80));
          return;
        }

        // setupComplete
        if (data.setupComplete || data.setup_complete) {
          this.setupComplete = true;
          this._log('setupComplete ✓');
          this._flushPendingAudio();
          return;
        }

        // Audio response (both camelCase and snake_case)
        const sc = data.serverContent || data.server_content;
        if (sc) {
          const parts = (sc.modelTurn && sc.modelTurn.parts)
            || (sc.model_turn && sc.model_turn.parts)
            || [];
          for (const part of parts) {
            const inl = part.inlineData || part.inline_data;
            if (inl && inl.data) {
              const mime = inl.mimeType || inl.mime_type || '';
              const rateMatch = /rate=(\d+)/.exec(mime);
              const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
              if (this.onAudioData) this.onAudioData(inl.data, sampleRate);
            } else if (part.text) {
              this._log('Warn: got text instead of audio');
            }
          }
          return;
        }

        // sessionResumptionUpdate — ignore
        if (data.sessionResumptionUpdate || data.session_resumption_update) return;

        // Log unknown message types
        const keys = Object.keys(data).join(',');
        this._log('Msg: ' + keys);

      } catch (err) {
        this._log('Parse err: ' + err.message);
      }
    });

    this.ws.addEventListener('error', () => {
      this._log('WS error');
      if (this.onError) this.onError(new Error('WebSocket connection failed'));
    });

    this.ws.addEventListener('close', (event) => {
      this.setupComplete = false;
      this._log(`Closed: ${event.code} ${event.reason || ''}`);
    });
  }

  _sendSetup() {
    const msg = {
      setup: {
        model: 'models/gemini-3.5-live-translate-preview',
        generationConfig: {
          responseModalities: ['AUDIO'],
          translationConfig: {
            targetLanguageCode: this.targetLang,
            echoTargetLanguage: true
          }
        },
        sessionResumption: { handle: null }
      }
    };
    this._sendJson(msg);
  }

  sendAudio(base64Pcm) {
    if (!this.setupComplete) {
      // Buffer up to 8 chunks while waiting for setupComplete
      this.pendingAudio.push(base64Pcm);
      if (this.pendingAudio.length > 8) this.pendingAudio.shift();
      return;
    }
    this._sendAudioNow(base64Pcm);
  }

  _sendAudioNow(base64Pcm) {
    this._sendJson({
      realtimeInput: {
        audio: {
          data: base64Pcm,
          mimeType: AUDIO_MIME
        }
      }
    });
  }

  _flushPendingAudio() {
    const pending = this.pendingAudio;
    this.pendingAudio = [];
    for (const chunk of pending) {
      this._sendAudioNow(chunk);
    }
  }

  _sendJson(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  _log(msg) {
    console.log('[Gemini]', msg);
    if (this.onStatus) this.onStatus(msg);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'client disconnect');
      this.ws = null;
    }
    this.setupComplete = false;
    this.pendingAudio = [];
  }
}

window.geminiService = new GeminiService();

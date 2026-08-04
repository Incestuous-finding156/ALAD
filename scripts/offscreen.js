// scripts/offscreen.js — Rewritten to match LivDub's audio capture & playback architecture

let stream = null;
let captureCtx = null;     // AudioContext for CAPTURE (native sample rate)
let playbackCtx = null;    // AudioContext for PLAYBACK (24kHz like LivDub)
let monitorGain = null;
let cleanupCapture = null;

// Playback state (matching LivDub's gapless scheduling)
let scheduledSources = [];
let scheduledOutputEndTime = 0;
let startedPlaying = false;
let queuedPcm = [];
let queuedSamples = 0;
let playbackSampleRate = 24000;

const CHUNK_MS = 100;        // LivDub uses 100ms chunks
const TARGET_RATE = 16000;   // Gemini expects 16kHz input
const BUFFER_BEFORE_PLAY_MS = 180;  // LivDub buffers 180ms before playing

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_CAPTURE') {
    if (message.settings && window.geminiService) {
      window.geminiService.updateSettings(message.settings);
    }
    startCapture(message.streamId);
  } else if (message.type === 'STOP_CAPTURE') {
    stopCapture();
  } else if (message.type === 'UPDATE_SETTINGS') {
    if (message.settings && window.geminiService) {
      window.geminiService.updateSettings(message.settings);
    }
  }
});

// ─── Base64 helpers (identical to LivDub) ──────────────────────
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 32768;
  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    const slice = bytes.subarray(offset, offset + CHUNK);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(b64) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

// ─── Resample Float32 from srcRate to dstRate (LivDub algorithm) ─
function resample(input, srcRate, dstRate) {
  if (dstRate === srcRate) return input;
  const ratio = srcRate / dstRate;
  const outLen = Math.round(input.length / ratio);
  const output = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcStart = Math.floor(i * ratio);
    const srcEnd = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    for (let j = srcStart; j < srcEnd; j++) sum += input[j];
    output[i] = sum / Math.max(1, srcEnd - srcStart);
  }
  return output;
}

// ─── Float32 → Int16 PCM (LivDub algorithm) ─────────────────────
function float32ToInt16(float32) {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return int16.buffer;
}

// ─── CAPTURE: Grab tab audio, resample, send to Gemini ──────────
async function startCapture(streamId) {
  try {
    log('Starting capture...');
    
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    // Create capture AudioContext at NATIVE sample rate (like LivDub)
    captureCtx = new AudioContext();
    const source = captureCtx.createMediaStreamSource(stream);
    
    // Monitor gain: let user hear original audio at low volume (like LivDub)
    monitorGain = captureCtx.createGain();
    monitorGain.gain.value = 0.15; // 15% background volume
    source.connect(monitorGain);
    monitorGain.connect(captureCtx.destination);

    // PCM capture: resample to 16kHz and chunk into 100ms buffers
    const chunkSize = Math.floor(TARGET_RATE * CHUNK_MS / 1000); // 1600 samples per chunk
    let accumulator = new Float32Array(0);

    const processCapturedAudio = (float32Data) => {
      // Resample from native rate to 16kHz
      const resampled = resample(float32Data, captureCtx.sampleRate, TARGET_RATE);
      
      // Accumulate
      const newBuf = new Float32Array(accumulator.length + resampled.length);
      newBuf.set(accumulator, 0);
      newBuf.set(resampled, accumulator.length);
      accumulator = newBuf;
      
      // Emit full chunks
      while (accumulator.length >= chunkSize) {
        const chunk = accumulator.slice(0, chunkSize);
        accumulator = accumulator.slice(chunkSize);
        
        const int16Buf = float32ToInt16(chunk);
        const b64 = arrayBufferToBase64(int16Buf);
        if (window.geminiService) {
          window.geminiService.sendAudio(b64);
        }
      }
    };

    // Try AudioWorklet first, fall back to ScriptProcessor
    let cleanupFn;
    if ('audioWorklet' in captureCtx) {
      try {
        await captureCtx.audioWorklet.addModule('pcm-processor.js');
        const workletNode = new AudioWorkletNode(captureCtx, 'pcm-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [1]
        });
        workletNode.port.onmessage = (e) => {
          // pcm-processor sends Float32 channel data
          processCapturedAudio(new Float32Array(e.data));
        };
        // Connect: source → worklet → silence (gain=0 → destination)
        const silenceGain = captureCtx.createGain();
        silenceGain.gain.value = 0;
        source.connect(workletNode);
        workletNode.connect(silenceGain);
        silenceGain.connect(captureCtx.destination);
        cleanupFn = () => { workletNode.port.close(); workletNode.disconnect(); silenceGain.disconnect(); };
      } catch (e) {
        log('AudioWorklet failed, using ScriptProcessor: ' + e.message);
        const scriptNode = captureCtx.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = (event) => {
          processCapturedAudio(event.inputBuffer.getChannelData(0));
        };
        const silenceGain = captureCtx.createGain();
        silenceGain.gain.value = 0;
        source.connect(scriptNode);
        scriptNode.connect(silenceGain);
        silenceGain.connect(captureCtx.destination);
        cleanupFn = () => { scriptNode.disconnect(); silenceGain.disconnect(); };
      }
    } else {
      const scriptNode = captureCtx.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = (event) => {
        processCapturedAudio(event.inputBuffer.getChannelData(0));
      };
      const silenceGain = captureCtx.createGain();
      silenceGain.gain.value = 0;
      source.connect(scriptNode);
      scriptNode.connect(silenceGain);
      silenceGain.connect(captureCtx.destination);
      cleanupFn = () => { scriptNode.disconnect(); silenceGain.disconnect(); };
    }
    cleanupCapture = cleanupFn;

    if (captureCtx.state === 'suspended') await captureCtx.resume();

    // Create PLAYBACK AudioContext at 24kHz (LivDub does this)
    playbackCtx = new AudioContext({ sampleRate: 24000 });
    if (playbackCtx.state === 'suspended') await playbackCtx.resume();
    resetPlaybackState();

    // Connect Gemini
    if (window.geminiService) {
      window.geminiService.onAudioData = onGeminiAudio;
      window.geminiService.onError = (err) => { log('Error: ' + err.message); };
      window.geminiService.onStatus = (status) => { log(status); };
      window.geminiService.connect();
    }

    log('Capture started OK');
  } catch (error) {
    log('Capture error: ' + error.message);
  }
}

// ─── PLAYBACK: Gapless scheduling (LivDub algorithm) ────────────
function resetPlaybackState() {
  stopScheduledSources();
  queuedPcm = [];
  queuedSamples = 0;
  startedPlaying = false;
  scheduledOutputEndTime = 0;
}

function onGeminiAudio(base64Data, sampleRate) {
  if (!playbackCtx) return;
  if (playbackCtx.state === 'suspended') playbackCtx.resume();

  const pcmBuf = base64ToArrayBuffer(base64Data);
  if (pcmBuf.byteLength < 2) return;

  if (sampleRate > 0) playbackSampleRate = sampleRate;
  
  const numSamples = pcmBuf.byteLength / 2;
  queuedPcm.push(pcmBuf.slice(0));  // copy
  queuedSamples += numSamples;

  // Trim if too much buffered (>700ms)
  trimQueuedBudget();

  // Wait for enough data before starting playback
  const bufferedMs = (queuedSamples / playbackSampleRate) * 1000;
  if (!startedPlaying) {
    if (bufferedMs < BUFFER_BEFORE_PLAY_MS) return;
    startedPlaying = true;
    log('Playback started');
  }

  drainQueue();
}

function trimQueuedBudget() {
  let ms = (queuedSamples / playbackSampleRate) * 1000;
  while (queuedPcm.length > 0 && ms > 700) {
    const dropped = queuedPcm.shift();
    if (!dropped) break;
    const samples = dropped.byteLength / 2;
    queuedSamples = Math.max(0, queuedSamples - samples);
    ms = (queuedSamples / playbackSampleRate) * 1000;
  }
}

function drainQueue() {
  if (!playbackCtx || !startedPlaying) return;
  
  const minChunkSamples = Math.max(1, Math.floor(playbackSampleRate * 80 / 1000));
  
  while (queuedSamples > 0) {
    const aheadMs = (scheduledOutputEndTime - playbackCtx.currentTime) * 1000;
    if (aheadMs >= 220) break;  // enough scheduled
    if (aheadMs > 80 && queuedSamples < minChunkSamples) break;
    
    const take = queuedSamples >= minChunkSamples ? minChunkSamples : queuedSamples;
    const pcmBuffer = takeQueuedSamples(take);
    if (!pcmBuffer) break;
    
    scheduleGapless(pcmBuffer);
  }
}

function takeQueuedSamples(count) {
  if (count <= 0 || queuedSamples < count) {
    if (queuedSamples <= 0) return null;
    count = queuedSamples;
  }
  const out = new Int16Array(count);
  let written = 0;
  while (written < count && queuedPcm.length > 0) {
    const src = new Int16Array(queuedPcm[0]);
    const need = count - written;
    if (src.length <= need) {
      out.set(src, written);
      written += src.length;
      queuedPcm.shift();
    } else {
      out.set(src.subarray(0, need), written);
      const remaining = src.subarray(need);
      queuedPcm[0] = remaining.buffer.slice(remaining.byteOffset, remaining.byteOffset + remaining.byteLength);
      written += need;
    }
  }
  queuedSamples -= written;
  return out.buffer;
}

function scheduleGapless(int16Buffer) {
  if (!playbackCtx) return;

  // Convert Int16 PCM to AudioBuffer
  const samples = new Int16Array(int16Buffer);
  const audioBuffer = playbackCtx.createBuffer(1, samples.length, playbackSampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    channelData[i] = samples[i] / 32768;
  }

  const sourceNode = playbackCtx.createBufferSource();
  const gainNode = playbackCtx.createGain();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(gainNode);
  gainNode.connect(playbackCtx.destination);

  const now = playbackCtx.currentTime;
  const startAt = scheduledOutputEndTime > now + 0.02
    ? scheduledOutputEndTime
    : now + 0.02;

  // Fade in if starting fresh
  if (scheduledOutputEndTime <= now) {
    gainNode.gain.setValueAtTime(0, startAt);
    gainNode.gain.linearRampToValueAtTime(1, startAt + Math.min(0.012, audioBuffer.duration / 2));
  } else {
    gainNode.gain.setValueAtTime(1, startAt);
  }

  sourceNode.start(startAt);
  scheduledOutputEndTime = startAt + audioBuffer.duration;
  scheduledSources.push(sourceNode);

  sourceNode.onended = () => {
    scheduledSources = scheduledSources.filter(s => s !== sourceNode);
    sourceNode.disconnect();
    gainNode.disconnect();
    drainQueue();
  };
}

function stopScheduledSources() {
  for (const s of scheduledSources) {
    try { s.stop(); } catch (e) {}
  }
  scheduledSources = [];
}

// ─── STOP ─────────────────────────────────────────────────────────
function stopCapture() {
  if (window.geminiService) window.geminiService.disconnect();
  if (cleanupCapture) { cleanupCapture(); cleanupCapture = null; }
  if (monitorGain) { monitorGain.disconnect(); monitorGain = null; }
  stopScheduledSources();
  if (captureCtx) { captureCtx.close(); captureCtx = null; }
  if (playbackCtx) { playbackCtx.close(); playbackCtx = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  resetPlaybackState();
}

// ─── LOGGING ──────────────────────────────────────────────────────
function log(msg) {
  console.log('[LAD]', msg);
  chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', status: msg }).catch(() => {});
}

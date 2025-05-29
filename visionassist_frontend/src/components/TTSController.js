//
// TTSController.js
//
// PUBLIC_INTERFACE
// Text-to-Speech (TTS) Controller utility for VisionAssist app.
// Encapsulates browser speech synthesis, providing a reusable API for all components.
// Features: speak, stop/cancel, voice selection, message queuing/interruption, fallback if unsupported.
// USAGE EXAMPLE PROVIDED BELOW.
//

/**
 * TTSController - Singleton-style utility class for Web Speech API
 * Usage:
 *   import TTSController from './TTSController';
 *   // Speak with default/current settings
 *   TTSController.speak("Hello world");
 *   // Stop ongoing speech
 *   TTSController.stop();
 *   // Optional: Set active voice by passing in the voice object or voice name
 *   const voices = TTSController.getVoices();
 *   TTSController.selectVoice(voices[0]);
 *   // Check browser TTS support
 *   if (!TTSController.isTTSSupported()) { ... }
 *
 * To use with React hooks or context, simply call methods directly as above.
 */

class TTSController {
  // Singleton instance
  static _instance = null;

  // PUBLIC_INTERFACE
  /**
   * Returns the singleton instance
   */
  static getInstance() {
    if (!TTSController._instance) {
      TTSController._instance = new TTSController();
    }
    return TTSController._instance;
  }

  constructor() {
    // Browser SpeechSynthesis API
    this.speechSynthesis = window.speechSynthesis || null;
    this.utter = null;
    this.voice = null;
    this.queue = [];
    this.isSpeaking = false;
    this.voices = [];
    this.repopulateVoices();
    // Keep voices up to date (voice list may be loaded asynchronously)
    if (this.speechSynthesis && typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = this.repopulateVoices.bind(this);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Repopulate the available voices list from the SpeechSynthesis API.
   */
  repopulateVoices() {
    if (this.speechSynthesis) {
      this.voices = this.speechSynthesis.getVoices ? this.speechSynthesis.getVoices() : [];
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Returns true if browser TTS is available
   */
  isTTSSupported() {
    return !!(this.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  // PUBLIC_INTERFACE
  /**
   * Returns available voices (empty [] if none/unsupported).
   */
  getVoices() {
    return this.voices || [];
  }

  // PUBLIC_INTERFACE
  /**
   * Selects a specific voice for subsequent TTS output.
   * Takes a SpeechSynthesisVoice object or the name of the voice.
   * Returns true if successfully set; false if not found.
   */
  selectVoice(voiceOrName) {
    if (!this.isTTSSupported()) return false;
    let voiceObj = null;
    if (typeof voiceOrName === 'object' && voiceOrName && voiceOrName.voiceURI) {
      voiceObj = voiceOrName;
    } else if (typeof voiceOrName === 'string') {
      voiceObj = this.voices.find((v) => v.name === voiceOrName || v.voiceURI === voiceOrName);
    }
    if (voiceObj) {
      this.voice = voiceObj;
      return true;
    }
    return false;
  }

  // PUBLIC_INTERFACE
  /**
   * Speaks a given text string, managing queue/interruption logic.
   * If a message is being spoken: interrupts or, if queue=true, queues message.
   * Params:
   *   text: string - message to speak
   *   options: {
   *     queue: (boolean, default false) - if true, will add to speech queue
   *     voice: (SpeechSynthesisVoice or name, optional) - per-message override
   *     rate: (number, optional) - 0.1-10, default=1
   *     pitch: (number, optional) - 0-2, default=1
   *     volume: (number, optional) - 0-1, default=1
   *     lang: (string, optional) - BCP-47 language tag
   *     onEnd: (function, optional) - callback after speech ends
   *     onError: (function, optional) - callback on error
   *   }
   * Returns false if unsupported.
   */
  speak(text, options = {}) {
    if (!this.isTTSSupported()) {
      this.showTTSUnavailableFallback();
      return false;
    }
    if (!text || typeof text !== "string" || !text.trim()) return false;

    const message = {
      text: text,
      options
    };
    if (options.queue) {
      this.queue.push(message);
      if (!this.isSpeaking) {
        this._processQueue();
      }
    } else {
      // Interrupt current and immediately speak new message
      this.stop();
      this.queue = [];
      this.queue.push(message);
      this._processQueue();
    }
    return true;
  }

  /**
   * Processes (and speaks) the next message in the queue.
   * INTERNAL USE ONLY.
   */
  _processQueue() {
    if (!this.queue.length) {
      this.isSpeaking = false;
      return;
    }
    const { text, options } = this.queue.shift();
    this.isSpeaking = true;

    if (!this.isTTSSupported()) {
      this.showTTSUnavailableFallback();
      this.isSpeaking = false;
      return;
    }
    // Create utterance
    const utter = new window.SpeechSynthesisUtterance(text);

    // Apply options
    utter.rate = options.rate || 1;
    utter.pitch = options.pitch || 1;
    utter.volume = options.volume !== undefined ? options.volume : 1;

    let chosenVoice = this.voice;
    if (options.voice) {
      if (typeof options.voice === 'object' && options.voice.voiceURI) {
        chosenVoice = options.voice;
      } else if (typeof options.voice === 'string') {
        chosenVoice = this.voices.find(v => v.name === options.voice || v.voiceURI === options.voice) || chosenVoice;
      }
    } else if (!chosenVoice && this.voices.length) {
      // Pick a default English voice if available
      chosenVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en")) || this.voices[0];
    }
    if (chosenVoice) utter.voice = chosenVoice;
    if (options.lang) utter.lang = options.lang;

    // Event handlers
    utter.onend = () => {
      this.isSpeaking = false;
      if (typeof options.onEnd === "function") options.onEnd();
      // Continue with next message if any
      if (this.queue.length) {
        this._processQueue();
      }
    };
    utter.onerror = (e) => {
      this.isSpeaking = false;
      if (typeof options.onError === "function") options.onError(e);
      // Skip to next in queue
      if (this.queue.length) this._processQueue();
    };

    this.utter = utter;
    this.speechSynthesis.speak(utter);
  }

  // PUBLIC_INTERFACE
  /**
   * Immediately stops/cancels any ongoing speech and empties the queue.
   */
  stop() {
    if (this.isTTSSupported()) {
      this.queue = [];
      this.isSpeaking = false;
      this.speechSynthesis.cancel();
    }
  }

  // PUBLIC_INTERFACE
  /**
   * (Optional) Pause current speech.
   */
  pause() {
    if (this.isTTSSupported() && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }

  // PUBLIC_INTERFACE
  /**
   * (Optional) Resume paused speech.
   */
  resume() {
    if (this.isTTSSupported() && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fallback: visually posts a message if TTS unavailable.
   * (Apps may wish to override this for custom UI)
   */
  showTTSUnavailableFallback() {
    // For accessibility, try to visually announce
    if (typeof document !== "undefined") {
      let elem = document.getElementById("tts-fallback-message");
      if (!elem) {
        elem = document.createElement("div");
        elem.id = "tts-fallback-message";
        elem.style.position = "fixed";
        elem.style.bottom = "16px";
        elem.style.left = "16px";
        elem.style.padding = "16px";
        elem.style.background = "#FFD600";
        elem.style.color = "#000";
        elem.style.fontSize = "1.2rem";
        elem.style.fontWeight = "bold";
        elem.style.zIndex = "9999";
        elem.style.borderRadius = "6px";
        elem.setAttribute("role", "alert");
        elem.setAttribute("aria-live", "assertive");
        document.body.appendChild(elem);
      }
      elem.textContent = "Text-to-Speech is not available on this browser.";
      elem.style.display = "block";
      setTimeout(() => {
        if (elem) elem.style.display = "none";
      }, 4000);
    }
  }
}

// Export singleton as default for ease of use.
export default TTSController.getInstance();

/*
------------------------------------
EXAMPLE USAGE:
import TTSController from './TTSController';

if (TTSController.isTTSSupported()) {
  TTSController.speak("VisionAssist ready! All features enabled.");
} else {
  // Optionally, show visual warning for users.
  alert("TTS is not available in your browser.");
}

// To pick a different voice (if supported):
const voices = TTSController.getVoices();
if (voices && voices.length > 0) {
  TTSController.selectVoice(voices[0]); // or by name
}

// Queue multiple phrases (each will play sequentially)
TTSController.speak("Welcome, user!", {queue: true});
TTSController.speak("VisionAssist is now active.", {queue: true});

// Interrupt everything and speak new
TTSController.speak("Emergency message!", {queue: false});

// To cancel all ongoing TTS
TTSController.stop();
------------------------------------
*/

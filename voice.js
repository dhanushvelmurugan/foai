/**
 * voice.js - Browser-Native Voice & Speech Synthesis System
 * 
 * Leverages native Web Speech API (SpeechSynthesis & webkitSpeechRecognition)
 * with zero cloud dependencies or external ML API keys.
 */

class VoiceSystem {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.selectedVoice = null;
    this.transcript = "";

    this.onInterviewerStart = null;
    this.onInterviewerEnd = null;
    this.onCandidateTranscript = null;
    this.onCandidateStateChange = null;
    this.onError = null;

    this.initSpeechSynthesis();
    this.initSpeechRecognition();
  }

  initSpeechSynthesis() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high quality English voices (Google US English, Microsoft Jenny, David, Samantha)
      const preferred = voices.find(v => 
        (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Jenny") || v.name.includes("Samantha")))
      ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

      this.selectedVoice = preferred;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser. Fallback to text input.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onCandidateStateChange) this.onCandidateStateChange(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans + " ";
          } else {
            interimTranscript += trans;
          }
        }

        if (finalTranscript) {
          this.transcript += (this.transcript ? " " : "") + finalTranscript.trim();
        }

        const displayText = (this.transcript + " " + interimTranscript).trim();
        if (this.onCandidateTranscript) {
          this.onCandidateTranscript(displayText, this.transcript.trim());
        }
      };

      this.recognition.onerror = (err) => {
        console.error("Speech recognition error:", err.error);
        if (err.error === "no-speech") return; // Benign timeout
        if (this.onError) this.onError(err.error);
      };

      this.recognition.onend = () => {
        // If meant to be listening still (browser auto-cutoff after silence), restart
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            if (this.onCandidateStateChange) this.onCandidateStateChange(false);
          }
        } else {
          if (this.onCandidateStateChange) this.onCandidateStateChange(false);
        }
      };
    } catch (e) {
      console.error("SpeechRecognition initialization failed:", e);
    }
  }

  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  speak(text, onComplete) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onInterviewerStart) this.onInterviewerStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onInterviewerEnd) this.onInterviewerEnd();
      if (onComplete) onComplete();
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis error:", err);
      this.isSpeaking = false;
      if (this.onInterviewerEnd) this.onInterviewerEnd();
      if (onComplete) onComplete();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onInterviewerEnd) this.onInterviewerEnd();
    }
  }

  startListening(initialText = "") {
    this.transcript = initialText || "";
    if (!this.recognition) return false;

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn("Recognition already active or failed to start", e);
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    if (this.onCandidateStateChange) this.onCandidateStateChange(false);
    return this.transcript;
  }

  resetTranscript() {
    this.transcript = "";
  }
}

const voiceManager = new VoiceSystem();

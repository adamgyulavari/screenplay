class TTSService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
  }

  /**
   * Process text for TTS by removing italics and limiting to last ~100 characters
   * around natural break points (sentences, commas)
   */
  processTextForTTS(text: string, maxLength: number = 100): string {
    // Remove italics (text between asterisks)
    let cleanText = text.replace(/\*[^*]+\*/g, '');
    
    // If text is already short enough, return it
    if (cleanText.length <= maxLength) {
      return cleanText;
    }
    
    // Find the best break point in the last portion of text
    const lastPortion = cleanText.slice(-maxLength * 1.5); // Look at last 150% of maxLength
    
    // Try to find a good break point
    let bestBreakIndex = -1;
    
    // Look for sentence endings first (highest priority)
    const sentenceMatches = [...lastPortion.matchAll(/[.!?]\s+/g)];
    for (const match of sentenceMatches) {
      const matchIndex = match.index!;
      if (matchIndex >= maxLength * 0.5) { // Prefer breaks in the last 50% of maxLength
        bestBreakIndex = matchIndex + match[0].length; // Start after the punctuation
        break;
      }
    }
    
    // If no sentence break found, look for commas
    if (bestBreakIndex === -1) {
      const commaMatches = [...lastPortion.matchAll(/,\s+/g)];
      for (const match of commaMatches) {
        const matchIndex = match.index!;
        if (matchIndex >= maxLength * 0.5) {
          bestBreakIndex = matchIndex + match[0].length; // Start after the comma
          break;
        }
      }
    }
    
    // If still no good break point found, just take the last maxLength characters
    if (bestBreakIndex === -1) {
      return cleanText.slice(-maxLength);
    }
    
    // Return text from the break point to the end
    const startIndex = cleanText.length - lastPortion.length + bestBreakIndex;
    const result = cleanText.slice(startIndex);
    
    // Ensure we don't return empty string
    return result || cleanText.slice(-maxLength);
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  getHungarianVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.startsWith('hu') || voice.lang.startsWith('hu-HU')
    );
  }

  getDefaultVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    // Try to find Hungarian voice first
    const hungarianVoice = voices.find(voice => voice.lang.startsWith('hu'));
    if (hungarianVoice) return hungarianVoice;
    
    // Fallback to default voice
    return voices.find(voice => voice.default) || voices[0] || null;
  }

  speak(text: string, language: string = 'hu-HU'): void {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Stop any current speech
    this.stop();

    // Process text for TTS
    const processedText = this.processTextForTTS(text);

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(processedText);
    this.utterance.lang = language;
    this.utterance.rate = 1.05; // Slightly slower for better pronunciation
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    // Set voice if available
    const voice = this.getDefaultVoice();
    if (voice) {
      this.utterance.voice = voice;
    }

    // Add event listeners
    this.utterance.onend = () => {
      this.utterance = null;
    };

    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.utterance = null;
    };

    // Start speaking
    this.synthesis.speak(this.utterance);
  }

  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.utterance = null;
  }

  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }
}

// Create singleton instance
export const ttsService = new TTSService();

// Initialize voices when they become available
if (typeof window !== 'undefined') {
  // Chrome loads voices asynchronously
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices are now available
    };
  }
} 

import { store } from '../store';
import { setTTS } from '../store/appSlice';

// TTS Configuration - easily switch between providers
const TTS_CONFIG = {
  provider: 'google' as 'google' | 'browser',
  googleEndpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  language: 'hu-HU',
};

class TTSService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;

    // Turn off TTS when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        store.dispatch(setTTS(false));
      }
    });
  }

  processTextForTTS(text: string, maxLength: number = 120): string {
    let cleanText = text.replace(/\*[^*]+\*/g, '');

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    const words = cleanText.split(/\s+/);

    let currentLength = 0;
    let wordIndex = words.length - 1;
    const targetLength = maxLength * 0.8;

    while (wordIndex >= 0 && currentLength < targetLength) {
      currentLength += words[wordIndex].length + 1;
      wordIndex--;
    }

    let startWordIndex = Math.max(0, wordIndex + 1);
    let foundBreakPoint = false;

    for (let i = startWordIndex; i < words.length; i++) {
      const word = words[i];
      currentLength += word.length + 1;

      if (/[.!?]$/.test(word)) {
        startWordIndex = i + 1;
        foundBreakPoint = true;
        break;
      }

      if (/,$/.test(word)) {
        startWordIndex = i + 1;
        foundBreakPoint = true;
        break;
      }

      if (currentLength > maxLength && !foundBreakPoint) {
        break;
      }
    }

    if (!foundBreakPoint) {
      currentLength = 0;
      wordIndex = words.length - 1;

      while (wordIndex >= 0 && currentLength < targetLength) {
        currentLength += words[wordIndex].length + 1;
        wordIndex--;
      }

      startWordIndex = Math.max(0, wordIndex + 1);
    }

    return words.slice(startWordIndex).join(' ');
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  getHungarianVoices(): SpeechSynthesisVoice[] {
    if (TTS_CONFIG.provider === 'google') {
      return this.getAvailableVoices().filter(voice =>
        voice.lang.startsWith('hu')
      );
    }
    return this.getAvailableVoices().filter(
      voice => voice.lang.startsWith('hu') || voice.lang.startsWith('hu-HU')
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

  async speak(text: string, apiKey: string | null): Promise<void> {
    const processedText = this.processTextForTTS(text);
    if (TTS_CONFIG.provider === 'google' && apiKey) {
      await this.speakWithGoogle(processedText, TTS_CONFIG.language, apiKey);
    } else {
      this.speakWithBrowser(processedText, TTS_CONFIG.language);
    }
  }

  private async speakWithGoogle(
    text: string,
    language: string,
    apiKey: string
  ): Promise<void> {
    try {
      // Stop any current audio
      this.stop();

      const response = await fetch(TTS_CONFIG.googleEndpoint, {
        method: 'POST',
        headers: {
          'X-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language,
            name: 'hu-HU-Standard-B',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.05,
            pitch: 0,
            volumeGainDb: 0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google TTS API error: ${response.status}`);
      }

      const audioData = await response.json();

      // Convert base64 audio to blob
      const audioBytes = atob(audioData.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.play();

      // Cleanup when done
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      };
    } catch (error) {
      console.error('Google TTS error:', error);
      // Fallback to browser TTS if Google fails
      this.speakWithBrowser(text, language);
    }
  }

  private speakWithBrowser(text: string, language: string): void {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Stop any current speech
    this.stop();

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = language;
    this.utterance.rate = 1.05;
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

    this.utterance.onerror = event => {
      console.error('Speech synthesis error:', event);
      this.utterance = null;
    };

    // Start speaking
    this.synthesis.speak(this.utterance);
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.utterance = null;
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

/// <reference types="vite/client" />

// Web Speech API type declarations
interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
}

interface SpeechSynthesis extends EventTarget {
  speaking: boolean;
  paused: boolean;
  pending: boolean;
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null;
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
}

interface Window {
  speechSynthesis: SpeechSynthesis;
  SpeechSynthesisUtterance: {
    new(text?: string): SpeechSynthesisUtterance;
  };
}

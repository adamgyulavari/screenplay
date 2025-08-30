import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character, DialogueItem } from '../types/screenplay';
import { splitLongText } from '../utils/screenplay';

interface AppState {
  characters: Character[];
  selectedCharacter: Character | null;
  screenplay: DialogueItem[];
  currentDialogueIndex: number | null;
  currentSegmentIndex: number;
  segments: string[];
  showLine: boolean;
  isAuthenticated: boolean;
  ttsEnabled: boolean;
  ttsLanguage: string;
}

const initialState: AppState = {
  characters: [],
  selectedCharacter: null,
  screenplay: [],
  currentDialogueIndex: 0,
  currentSegmentIndex: 0,
  segments: [],
  showLine: false,
  isAuthenticated: false,
  ttsEnabled: false,
  ttsLanguage: 'hu-HU',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.characters = action.payload;
    },
    setScreenplay: (state, action: PayloadAction<DialogueItem[]>) => {
      state.screenplay = action.payload;
    },
    setSelectedCharacter: (state, action: PayloadAction<Character | null>) => {
      state.selectedCharacter = action.payload;
      if (state.selectedCharacter) {
        state.currentDialogueIndex = state.selectedCharacter.dialogues[0];
        state.segments = splitLongText(state.screenplay[state.currentDialogueIndex].text);
        state.currentSegmentIndex = 0;
        state.showLine = false;
      }
    },
    clearSelectedCharacter: (state) => {
      state.selectedCharacter = null;
      state.currentDialogueIndex = null;
      state.currentSegmentIndex = 0;
      state.segments = [];
      state.showLine = false;
    },
    jump: (state, action: PayloadAction<number>) => {
      state.currentDialogueIndex = action.payload;
      state.segments = splitLongText(state.screenplay[state.currentDialogueIndex].text);
      state.currentSegmentIndex = 0;
      state.showLine = false;
    },
    advance: (state) => {
      if (!state.selectedCharacter) return;
      if (state.currentDialogueIndex === null) return;
      if (!state.showLine) {
        state.showLine = true;
        return;
      }
      if (state.currentSegmentIndex < state.segments.length - 1) {
        state.currentSegmentIndex++;
      } else {
        const index = state.selectedCharacter.dialogues.findIndex(dialogue => dialogue === state.currentDialogueIndex);
        if (index !== undefined && index < state.selectedCharacter.dialogues.length - 1) {
          state.currentDialogueIndex = state.selectedCharacter.dialogues[index + 1];
          state.segments = splitLongText(state.screenplay[state.currentDialogueIndex].text);
          state.currentSegmentIndex = 0;
          state.showLine = false;
        } else {
          state.currentDialogueIndex = null;
        }
      }
    },
    moveBack: (state) => {
      if (!state.selectedCharacter) return;
      if (state.currentDialogueIndex === null) return;
      if (state.currentSegmentIndex > 0) {
        state.currentSegmentIndex--;
      } else {
        const index = state.selectedCharacter.dialogues.findIndex(dialogue => dialogue === state.currentDialogueIndex);
        if (index !== undefined && index > 0) {
          state.currentDialogueIndex = state.selectedCharacter.dialogues[index - 1];
          state.segments = splitLongText(state.screenplay[state.currentDialogueIndex].text);
          state.currentSegmentIndex = state.segments.length - 1;
          state.showLine = true;
        }
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    toggleTTS: (state) => {
      state.ttsEnabled = !state.ttsEnabled;
    },
    setTTSLanguage: (state, action: PayloadAction<string>) => {
      state.ttsLanguage = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.selectedCharacter = null;
      state.currentDialogueIndex = null;
      state.currentSegmentIndex = 0;
      state.segments = [];
    },
  },
});

export const { 
  advance,
  clearSelectedCharacter,
  moveBack,
  setCharacters,
  jump,
  setScreenplay,
  setSelectedCharacter,
  setAuthenticated,
  toggleTTS,
  setTTSLanguage,
  logout,
} = appSlice.actions;
export default appSlice.reducer; 

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character, DialogueItem } from '../types/screenplay';
import { splitLongText } from '../utils/screenplay';

interface AppState {
  screenplayId: string | null;
  characters: Character[];
  selectedCharacter: Character | null;
  screenplay: DialogueItem[];
  currentDialogueIndex: number | null;
  currentSegmentIndex: number;
  segments: string[];
  showLine: boolean;
  isAuthenticated: boolean;
  ttsEnabled: boolean;
  apiKey: string | null;
}

const initialState: AppState = {
  screenplayId: null,
  characters: [],
  selectedCharacter: null,
  screenplay: [],
  currentDialogueIndex: 0,
  currentSegmentIndex: 0,
  segments: [],
  showLine: false,
  isAuthenticated: false,
  ttsEnabled: false,
  apiKey: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedCharacter: (state, action: PayloadAction<Character | null>) => {
      state.selectedCharacter = action.payload;
      if (state.selectedCharacter) {
        state.currentDialogueIndex = state.selectedCharacter.dialogues[0];
        state.segments = splitLongText(
          state.screenplay[state.currentDialogueIndex].text
        );
        state.currentSegmentIndex = 0;
        state.showLine = false;
      }
    },
    clearSelectedCharacter: state => {
      state.selectedCharacter = null;
      state.currentDialogueIndex = null;
      state.currentSegmentIndex = 0;
      state.segments = [];
      state.showLine = false;
    },
    jump: (state, action: PayloadAction<number>) => {
      state.currentDialogueIndex = action.payload;
      state.segments = splitLongText(
        state.screenplay[state.currentDialogueIndex].text
      );
      state.currentSegmentIndex = 0;
      state.showLine = false;
    },
    advance: state => {
      if (!state.selectedCharacter) return;
      if (state.currentDialogueIndex === null) return;
      if (!state.showLine) {
        state.showLine = true;
        return;
      }
      if (state.currentSegmentIndex < state.segments.length - 1) {
        state.currentSegmentIndex++;
      } else {
        const index = state.selectedCharacter.dialogues.findIndex(
          dialogue => dialogue === state.currentDialogueIndex
        );
        if (
          index !== undefined &&
          index < state.selectedCharacter.dialogues.length - 1
        ) {
          state.currentDialogueIndex =
            state.selectedCharacter.dialogues[index + 1];
          state.segments = splitLongText(
            state.screenplay[state.currentDialogueIndex].text
          );
          state.currentSegmentIndex = 0;
          state.showLine = false;
        } else {
          state.currentDialogueIndex = null;
        }
      }
    },
    moveBack: state => {
      if (!state.selectedCharacter) return;
      if (state.currentDialogueIndex === null) return;
      if (state.currentSegmentIndex > 0) {
        state.currentSegmentIndex--;
      } else {
        const index = state.selectedCharacter.dialogues.findIndex(
          dialogue => dialogue === state.currentDialogueIndex
        );
        if (index !== undefined && index > 0) {
          state.currentDialogueIndex =
            state.selectedCharacter.dialogues[index - 1];
          state.segments = splitLongText(
            state.screenplay[state.currentDialogueIndex].text
          );
          state.currentSegmentIndex = state.segments.length - 1;
          state.showLine = true;
        }
      }
    },
    setTTS: (state, action: PayloadAction<boolean>) => {
      state.ttsEnabled = action.payload;
    },
    toggleTTS: state => {
      state.ttsEnabled = !state.ttsEnabled;
    },
    login: (
      state,
      action: PayloadAction<{
        screenplayId: string;
        apiKey: string | null;
        characters: Character[];
        screenplay: DialogueItem[];
        characterRole?: string | null;
        currentDialogueIndex?: number;
        currentSegmentIndex?: number;
      }>
    ) => {
      state.isAuthenticated = true;
      state.screenplayId = action.payload.screenplayId;
      state.apiKey = action.payload.apiKey;
      state.characters = action.payload.characters;
      state.screenplay = action.payload.screenplay;
      if (action.payload.characterRole != null) {
        const char = action.payload.characters.find(
          c => c.role === action.payload.characterRole
        );
        state.selectedCharacter = char ?? null;
      }
      if (action.payload.currentDialogueIndex != null) {
        state.currentDialogueIndex = action.payload.currentDialogueIndex;
      }
      if (action.payload.currentSegmentIndex != null) {
        state.currentSegmentIndex = action.payload.currentSegmentIndex;
      }
      if (state.selectedCharacter != null && state.currentDialogueIndex != null) {
        state.segments = splitLongText(
          state.screenplay[state.currentDialogueIndex].text
        );
      }
    },
    logout: state => {
      state.isAuthenticated = false;
      state.screenplayId = null;
      state.selectedCharacter = null;
      state.currentDialogueIndex = null;
      state.currentSegmentIndex = 0;
      state.segments = [];
      state.characters = [];
      state.screenplay = [];
      state.apiKey = null;
    },
  },
});

export const {
  advance,
  clearSelectedCharacter,
  moveBack,
  jump,
  setSelectedCharacter,
  setTTS,
  toggleTTS,
  login,
  logout,
} = appSlice.actions;
export default appSlice.reducer;

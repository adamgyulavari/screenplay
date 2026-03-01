import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Character,
  DialogueItem,
  ScreenplaySummary,
} from '../types/screenplay';
import { splitLongText } from '../utils/screenplay';
import type { NoteClient } from '../lib/screenplayNotes';

interface AppState {
  screenplayId: string | null;
  isOwner: boolean;
  notesViewOpen: boolean;
  characters: Character[];
  selectedCharacter: Character | null;
  screenplay: DialogueItem[];
  notes: NoteClient[];
  currentDialogueIndex: number | null;
  currentSegmentIndex: number;
  segments: string[];
  showLine: boolean;
  isAuthenticated: boolean;
  availableScreenplays: ScreenplaySummary[];
  ttsEnabled: boolean;
  apiKey: string | null;
}

const initialState: AppState = {
  screenplayId: null,
  isOwner: false,
  notesViewOpen: false,
  characters: [],
  selectedCharacter: null,
  screenplay: [],
  notes: [],
  currentDialogueIndex: 0,
  currentSegmentIndex: 0,
  segments: [],
  showLine: false,
  isAuthenticated: false,
  availableScreenplays: [],
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
    setAuthenticated: (
      state,
      action: PayloadAction<{ availableScreenplays: ScreenplaySummary[] }>
    ) => {
      state.isAuthenticated = true;
      state.availableScreenplays = action.payload.availableScreenplays;
    },
    deselectScreenplay: state => {
      state.screenplayId = null;
      state.isOwner = false;
      state.notesViewOpen = false;
      state.characters = [];
      state.selectedCharacter = null;
      state.screenplay = [];
      state.notes = [];
      state.currentDialogueIndex = 0;
      state.currentSegmentIndex = 0;
      state.segments = [];
      state.showLine = false;
      state.apiKey = null;
    },
    login: (
      state,
      action: PayloadAction<{
        availableScreenplays: ScreenplaySummary[];
        screenplayId: string;
        isOwner: boolean;
        apiKey: string | null;
        characters: Character[];
        screenplay: DialogueItem[];
        characterRole?: string | null;
        currentDialogueIndex?: number;
        currentSegmentIndex?: number;
      }>
    ) => {
      state.isAuthenticated = true;
      state.availableScreenplays = action.payload.availableScreenplays;
      state.screenplayId = action.payload.screenplayId;
      state.isOwner = action.payload.isOwner;
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
      if (
        state.selectedCharacter != null &&
        state.currentDialogueIndex != null
      ) {
        state.segments = splitLongText(
          state.screenplay[state.currentDialogueIndex].text
        );
      }
    },
    setNotesView: (state, action: PayloadAction<boolean>) => {
      state.notesViewOpen = action.payload;
    },
    setNotes: (state, action: PayloadAction<NoteClient[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<NoteClient>) => {
      state.notes.push(action.payload);
    },
    updateNote: (
      state,
      action: PayloadAction<{
        id: string;
        noteContent: string;
        updatedAt?: string;
      }>
    ) => {
      const n = state.notes.find(note => note.id === action.payload.id);
      if (n) {
        n.noteContent = action.payload.noteContent;
        if (action.payload.updatedAt != null)
          n.updatedAt = action.payload.updatedAt;
      }
    },
    removeNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload);
    },
    logout: state => {
      state.isAuthenticated = false;
      state.availableScreenplays = [];
      state.screenplayId = null;
      state.isOwner = false;
      state.notesViewOpen = false;
      state.notes = [];
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
  deselectScreenplay,
  moveBack,
  jump,
  setAuthenticated,
  setSelectedCharacter,
  setNotesView,
  setNotes,
  addNote,
  updateNote,
  removeNote,
  setTTS,
  toggleTTS,
  login,
  logout,
} = appSlice.actions;
export default appSlice.reducer;

export interface DialogueItem {
  id: string;
  index: number;
  role: string;
  text: string;
}

export interface Character {
  role: string;
  color: string;
  dialogues: number[];
}

export interface ScreenplaySummary {
  id: string;
  title: string;
  author: string | null;
  characterRole: string | null;
  isOwner: boolean;
}

export interface DialogueItem {
  index: number;
  role: string;
  text: string;
}

export interface Character {
  role: string;
  color: string;
  dialogues: number[];
}

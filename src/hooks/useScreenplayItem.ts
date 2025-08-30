import { useMemo } from 'react';
import { DialogueItem } from '../types/screenplay';
import { splitLongText } from '../utils/screenplay';

export const useScreenplayItem = (
  screenplay: DialogueItem[],
  index: number
): DialogueItem | undefined => {
  return useMemo(() => {
    if (index >= 0 && index < screenplay.length) {
      return screenplay[index];
    }
    return undefined;
  }, [screenplay, index]);
};

export const useScreenplayItems = (
  screenplay: DialogueItem[],
  indexes: number[]
): DialogueItem[] => {
  return useMemo(() => {
    return indexes
      .filter(index => index >= 0 && index < screenplay.length)
      .map(index => screenplay[index]);
  }, [screenplay, indexes]);
};

export const useTextSegments = (
  screenplay: DialogueItem[],
  index: number
): string[] => {
  return useMemo(() => {
    if (index >= 0 && index < screenplay.length) {
      const dialogueItem = screenplay[index];
      return splitLongText(dialogueItem.text);
    }
    return [];
  }, [screenplay, index]);
};

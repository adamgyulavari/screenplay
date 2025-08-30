import { DialogueItem } from '../types/screenplay';

// Split long text at natural punctuation points, preserving markdown formatting
export const splitLongText = (text: string, maxLength: number = 120): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments: string[] = [];
  
  // First, extract all italics (director instructions) as separate segments
  const italicRegex = /\*([^*]+)\*/g;
  const italicMatches: { text: string, start: number, end: number }[] = [];
  let match;
  
  while ((match = italicRegex.exec(text)) !== null) {
    italicMatches.push({
      text: match[0], // Full match including asterisks
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // If no italics, split normally
  if (italicMatches.length === 0) {
    return splitTextByPunctuation(text, maxLength);
  }
  
  // Process text with italics
  let lastEnd = 0;
  
  for (let i = 0; i < italicMatches.length; i++) {
    const italic = italicMatches[i];
    
    // Add text before this italic (if any)
    if (italic.start > lastEnd) {
      const beforeText = text.substring(lastEnd, italic.start).trim();
      if (beforeText) {
        const beforeSegments = splitTextByPunctuation(beforeText, maxLength);
        segments.push(...beforeSegments);
      }
    }
    
    // Add the italic as its own segment
    segments.push(italic.text);
    
    lastEnd = italic.end;
  }
  
  // Add remaining text after last italic (if any)
  if (lastEnd < text.length) {
    const afterText = text.substring(lastEnd).trim();
    if (afterText) {
      const afterSegments = splitTextByPunctuation(afterText, maxLength);
      segments.push(...afterSegments);
    }
  }
  
  return segments.filter(segment => segment.length > 0);
};

// Helper function to split text by punctuation (sentence level, then comma level)
const splitTextByPunctuation = (text: string, maxLength: number): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments: string[] = [];
  
  // Split by sentences first (periods, exclamation marks, question marks)
  const sentences = text.split(/([.!?]+)/);
  let currentSegment = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    const fullSentence = sentence + punctuation;
    
    if (currentSegment.length + fullSentence.length <= maxLength) {
      currentSegment += fullSentence;
    } else {
      if (currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = '';
      }
      
      // If a single sentence is too long, split by commas
      if (fullSentence.length > maxLength) {
        const commaSegments = splitByCommas(fullSentence, maxLength);
        segments.push(...commaSegments);
      } else {
        currentSegment = fullSentence;
      }
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment.trim());
  }
  
  return segments;
};

// Helper function to split by commas
const splitByCommas = (text: string, maxLength: number): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments: string[] = [];
  const commaSplit = text.split(/([,;:]+)/);
  let currentSegment = '';
  
  for (let j = 0; j < commaSplit.length; j += 2) {
    const part = commaSplit[j];
    const comma = commaSplit[j + 1] || '';
    const fullPart = part + comma;
    
    if (currentSegment.length + fullPart.length <= maxLength) {
      currentSegment += fullPart;
    } else {
      if (currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = '';
      }
      
      // If a part is still too long, split by spaces
      if (fullPart.length > maxLength) {
        const wordSegments = splitByWords(fullPart, maxLength);
        segments.push(...wordSegments);
      } else {
        currentSegment = fullPart;
      }
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment.trim());
  }
  
  return segments;
};

// Helper function to split by words (last resort)
const splitByWords = (text: string, maxLength: number): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments: string[] = [];
  const words = text.split(' ');
  let currentSegment = '';
  
  for (const word of words) {
    if (currentSegment.length + word.length + (currentSegment ? 1 : 0) <= maxLength) {
      currentSegment += (currentSegment ? ' ' : '') + word;
    } else {
      if (currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = word;
      } else {
        segments.push(word);
      }
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment.trim());
  }
  
  return segments;
};

export const processScreenplayData = (screenplay: DialogueItem[]) => {
  // First, collect all individual character names and group dialogues
  const individualCharacters = new Set<string>();
  const groupDialogues: { characters: string[], dialogue: DialogueItem }[] = [];
  
  screenplay.forEach(item => {
    if (item.role.includes(',')) {
      const characters = item.role.split(',').map(name => name.trim());
      characters.forEach(char => individualCharacters.add(char));
      groupDialogues.push({ characters, dialogue: item });
    } else {
      individualCharacters.add(item.role);
    }
  });
  
  // Simple color palette
  const colors = ['blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo', 'teal', 'orange', 'cyan', 'emerald', 'rose', 'violet', 'sky', 'lime', 'amber', 'fuchsia', 'slate', 'zinc', 'neutral', 'stone', 'gray'];
  
  // Create character dialogues for individual characters
  const result: { role: string, color: string, dialogues: number[] }[] = [];
  let index = 0;

  // Add individual character dialogues
  individualCharacters.forEach(characterRole => {
    const characterDialogues: number[] = [];
    
    // Get direct dialogue for this character
    const directLines = screenplay
      .map((item, index) => ({ ...item, index }))
      .filter(item => item.role === characterRole);

    // Get group dialogue that includes this character
    const groupLines = groupDialogues
      .filter(group => group.characters.includes(characterRole))
      .map(group => {
        const originalIndex = screenplay.findIndex(item => 
          item.role === group.dialogue.role && item.text === group.dialogue.text
        );
        return { ...group.dialogue, index: originalIndex };
      });

    // Combine and sort all lines for this character
    const allLines = [...directLines, ...groupLines].sort((a, b) => a.index - b.index);
    
    // Add all dialogue indexes for this character
    allLines.forEach(line => {
      characterDialogues.push(line.index);
    });
    
    result.push({
      role: characterRole,
      color: colors[index % colors.length],
      dialogues: characterDialogues
    });
    
    index++;
  });

  return result;
};

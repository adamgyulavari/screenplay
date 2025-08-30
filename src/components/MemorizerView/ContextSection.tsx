
import { useRef, useEffect } from 'react';
import { CharacterContextItem } from './CharacterContextItem';
import { FormattedText } from './FormattedText';
import { useAppSelector } from '../../store/hooks';
import { useScreenplayItems } from '../../hooks/useScreenplayItem';
import { ttsService } from '../../utils/tts';

export const ContextSection = ({ currentDialogueIndex }: { currentDialogueIndex: number }) => {
  const screenplay = useAppSelector((state) => state.app.screenplay);
  const ttsEnabled = useAppSelector((state) => state.app.ttsEnabled);
  const ttsLanguage = useAppSelector((state) => state.app.ttsLanguage);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate context range - show more context for better UX
  const contextStart = Math.max(0, currentDialogueIndex - 12);
  const contextEnd = Math.min(screenplay.length, currentDialogueIndex + 4);
  const contextIndexes = Array.from(
    { length: contextEnd - contextStart }, 
    (_, i) => contextStart + i
  );
  
  const contextItems = useScreenplayItems(screenplay, contextIndexes);

  const needsPseudoElement = currentDialogueIndex < 12;
  
  // Custom smooth scroll function
  const smoothScrollToElement = (element: HTMLElement, container: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const elementTop = elementRect.top;
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;

    // Calculate scroll position so the previous item (context) is at the bottom
    // and the current dialogue is out of view above
    const targetScrollTop = container.scrollTop + (elementTop - containerTop) - containerHeight + elementRect.height;
    
    // Smooth scroll to the target position
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };
  
  // Auto-scroll to current item when it changes
  useEffect(() => {
    if (scrollContainerRef.current && currentDialogueIndex >= 0) {
      // Add a small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // Find the previous dialogue element by its data attribute
          const targetElement = scrollContainerRef.current.querySelector(`[data-dialogue-index="${currentDialogueIndex - 1}"]`) as HTMLElement;
          if (targetElement) {
            smoothScrollToElement(targetElement, scrollContainerRef.current);
          } else {
            // If the target element isn't in the current context, wait for the next render cycle
            // This handles big jumps where the context needs to update
            requestAnimationFrame(() => {
              if (scrollContainerRef.current) {
                const retryElement = scrollContainerRef.current.querySelector(`[data-dialogue-index="${currentDialogueIndex - 1}"]`) as HTMLElement;
                if (retryElement) {
                  smoothScrollToElement(retryElement, scrollContainerRef.current);
                }
              }
            });
          }
        }
      }, 100);
    }
  }, [currentDialogueIndex]);

  // Auto-play TTS when a new context item is highlighted
  useEffect(() => {
    if (ttsEnabled && currentDialogueIndex > 0) {
      const previousDialogueIndex = currentDialogueIndex - 1;
      if (previousDialogueIndex >= 0 && previousDialogueIndex < screenplay.length) {
        const previousDialogue = screenplay[previousDialogueIndex];
        if (previousDialogue) {
          // Stop any current speech and start reading the new context
          ttsService.stop();
          setTimeout(() => {
            ttsService.speak(previousDialogue.text, ttsLanguage);
          }, 100); // Small delay to ensure smooth transition
        }
      }
    } else if (!ttsEnabled) {
      // Stop TTS when disabled
      ttsService.stop();
    }
  }, [currentDialogueIndex, ttsEnabled, ttsLanguage, screenplay]);

  // Cleanup TTS when component unmounts
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);
  
  if (!contextItems.length) return null;
  
  return (
    <div className="relative h-96 overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="h-full space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
      >
        {needsPseudoElement && (
          <div 
            className="opacity-0 pointer-events-none h-96"
            aria-hidden="true"
          />
        )}
        
        {contextItems.map((contextItem, idx) => {
          const isCurrentItem = contextIndexes[idx] === currentDialogueIndex - 1;
          const actualDialogueIndex = contextIndexes[idx];
          
          return (
            <div
              key={contextItem.role + actualDialogueIndex}
              data-dialogue-index={actualDialogueIndex}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isCurrentItem 
                  ? 'border-blue-400 bg-blue-900/30 opacity-100' 
                  : 'border-slate-600/50 bg-slate-800/30 opacity-70'
              }`}
            >
              <p className="text-slate-200 leading-relaxed">
                {contextItem.role.split(', ').map((role) => (
                  <CharacterContextItem key={role} role={role} />
                ))}
                <FormattedText text={contextItem.text} />
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Gradient overlay at top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />
    </div>
  );
}; 

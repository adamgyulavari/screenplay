import React from 'react';

interface FormattedTextProps {
  text: string;
  /** When set, each segment gets data-source-start for selection → source index. Em segments use +2 for the asterisks. */
  sourceStart?: number;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, sourceStart = undefined }) => {
  const parts = text.split(/(\*[^*]+\*)/g);
  let currentStart = sourceStart ?? 0;

  return (
    <>
      {parts.map((part, index) => {
        const segmentStart = sourceStart !== undefined ? currentStart : undefined;
        if (part.startsWith('*') && part.endsWith('*')) {
          const italicText = part.slice(1, -1);
          const el = (
            <em
              key={index}
              className="text-slate-400 font-normal select-none"
              {...(segmentStart !== undefined ? { 'data-source-start': segmentStart } : {})}
            >
              {italicText}
            </em>
          );
          if (sourceStart !== undefined) currentStart += part.length;
          return el;
        }
        const el = (
          <span
            key={index}
            {...(segmentStart !== undefined ? { 'data-source-start': segmentStart } : {})}
          >
            {part}
          </span>
        );
        if (sourceStart !== undefined) currentStart += part.length;
        return el;
      })}
    </>
  );
};

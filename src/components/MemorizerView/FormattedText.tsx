import React from 'react';

interface FormattedTextProps {
  text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const parts = text.split(/(\*[^*]+\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          // Remove asterisks and render as italic
          const italicText = part.slice(1, -1);
          return (
            <em key={index} className="text-slate-400 font-normal">
              {italicText}
            </em>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

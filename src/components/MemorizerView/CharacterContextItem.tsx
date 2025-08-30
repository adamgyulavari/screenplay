import React from 'react';
import { useCharacterColor } from '../../store/hooks';

interface CharacterContextItemProps {
  role: string;
}

export const CharacterContextItem: React.FC<CharacterContextItemProps> = ({ role }) => {
  const color = useCharacterColor(role);
  return (
    <span className={`me-5 mb-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-br from-${color}-500 to-${color}-700 text-white`}>
      {role}
    </span>
  );
}; 

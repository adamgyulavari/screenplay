import React from 'react';
import { useCharacterColor } from '../../store/hooks';

interface CharacterContextItemProps {
  role: string;
}

export const CharacterContextItem: React.FC<CharacterContextItemProps> = ({ role }) => {
  const color = useCharacterColor(role);
  return (
    <div className={`inline me-5 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-br from-${color}-500 to-${color}-700 text-white`}>
      {role}
    </div>
  );
}; 

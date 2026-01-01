
import React from 'react';

interface WritingGridProps {
  character: string;
}

const WritingGrid: React.FC<WritingGridProps> = ({ character }) => {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-amber-50 border-2 border-amber-200">
      <svg className="absolute inset-0 w-full h-full text-amber-300" strokeWidth="1">
        <line x1="1" y1="1" x2="100%" y2="1" />
        <line x1="1" y1="1" x2="1" y2="100%" />
        <line x1="100%" y1="1" x2="100%" y2="100%" />
        <line x1="1" y1="100%" x2="100%" y2="100%" />
        <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="4 2" />
        <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="4 2" />
        <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="4 2" />
        <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="4 2" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-hanzi text-6xl md:text-8xl text-slate-800">
        {character}
      </span>
    </div>
  );
};

export default WritingGrid;

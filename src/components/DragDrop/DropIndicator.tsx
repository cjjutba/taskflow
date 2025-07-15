import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropIndicatorProps {
  id: string;
  className?: string;
}

export default function DropIndicator({ id, className = '' }: DropIndicatorProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'drop-indicator',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${className} ${
        isOver ? 'h-2 bg-primary/20 border-2 border-dashed border-primary/40 rounded' : 'h-1'
      }`}
    />
  );
}

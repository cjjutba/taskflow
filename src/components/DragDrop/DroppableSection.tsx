import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../../contexts/TaskContext';

interface DroppableSectionProps {
  sectionId: string;
  tasks: Task[];
  children: React.ReactNode;
}

export default function DroppableSection({ sectionId, tasks, children }: DroppableSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: {
      type: 'section',
      sectionId,
    },
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`transition-all duration-200 rounded-lg ${
          isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
        }`}
      >
        {children}

        {/* Drop indicator when hovering over empty section */}
        {isOver && tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-primary font-medium">Drop task here</p>
            </div>
          </div>
        )}
      </div>
    </SortableContext>
  );
}

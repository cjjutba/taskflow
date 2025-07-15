import React from 'react';
import { Plus, Kanban } from 'lucide-react';
import { Button } from '../ui/button';

interface BoardEmptyStateProps {
  onCreateSection: () => void;
}

export default function BoardEmptyState({ onCreateSection }: BoardEmptyStateProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Kanban className="w-8 h-8 text-blue-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No sections yet
        </h3>

        {/* Description */}
        <p className="text-gray-500 mb-6 leading-relaxed">
          Create sections to organize your tasks in a kanban-style board. Each section can contain
          multiple tasks that you can drag and drop.
        </p>

        {/* Action Button */}
        <Button
          onClick={onCreateSection}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create First Section
        </Button>
      </div>
    </div>
  );
}

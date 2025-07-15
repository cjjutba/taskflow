import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit3, Trash2, GripVertical } from 'lucide-react';
import { useTask, Task, Section } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import BoardTaskCard from './BoardTaskCard';
import DraggableTask from '../DragDrop/DraggableTask';
import DroppableSection from '../DragDrop/DroppableSection';
import DropIndicator from '../DragDrop/DropIndicator';
import { cn } from '../../lib/utils';

interface BoardSectionProps {
  section: Section;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onAddTask: () => void;
  isUnsorted?: boolean;
}

export default function BoardSection({
  section,
  tasks,
  onEdit,
  onAddTask,
  isUnsorted = false,
}: BoardSectionProps) {
  const { dispatch } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== section.name && !isUnsorted) {
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          ...section,
          name: editName.trim(),
          updatedAt: new Date(),
        },
      });
    }
    setIsEditing(false);
    setEditName(section.name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(section.name);
  };

  const handleDeleteSection = () => {
    if (!isUnsorted && window.confirm(`Are you sure you want to delete the "${section.name}" section? Tasks will be moved to Unsorted.`)) {
      dispatch({ type: 'DELETE_SECTION', payload: section.id });
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="flex-shrink-0 w-64 rounded-lg p-2 h-full flex flex-col relative board-section-background overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 group">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag Handle */}
          {!isUnsorted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab section-drag-handle">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          {/* Section Name */}
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveEdit}
              className="h-6 text-xs font-semibold flex-1"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3
                className={cn(
                  'text-sm font-semibold text-foreground truncate cursor-pointer',
                  isUnsorted && 'text-muted-foreground'
                )}
                onClick={() => !isUnsorted && setIsEditing(true)}
              >
                {section.name}
              </h3>

              {/* Task Count */}
              <Badge variant="secondary" className="text-xs flex-shrink-0 bg-gray-100 text-gray-600 px-1 py-0 h-4 leading-none">
                {tasks.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Section Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onAddTask}
            >
              <Plus className="w-2.5 h-2.5" />
            </Button>
            
            {!isUnsorted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-2.5 h-2.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white border border-border shadow-lg">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDeleteSection}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Completed Progress */}
      {completedCount > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{completedCount}/{tasks.length} completed</span>
            <span>{Math.round((completedCount / tasks.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks Container */}
      <DroppableSection sectionId={section.id} tasks={tasks}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 min-h-0">
          {tasks.length === 0 ? (
            <div className="flex flex-col justify-center py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddTask}
                className="w-full gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 text-xs transition-all duration-200"
              >
                <Plus className="w-2.5 h-2.5" />
                Add Task
              </Button>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task.id}>
                {index === 0 && (
                  <DropIndicator
                    id={`${section.id}-drop-${index}`}
                    className="mb-1.5"
                  />
                )}
                <DraggableTask task={task}>
                  <BoardTaskCard
                    task={task}
                    onEdit={onEdit}
                  />
                </DraggableTask>
                <DropIndicator
                  id={`${section.id}-drop-${index + 1}`}
                  className="mt-1.5"
                />
              </div>
            ))
          )}
        </div>
      </DroppableSection>

      {/* Add Task Button - Always visible with good contrast */}
      {tasks.length > 0 && (
        <div className="mt-1 pt-1 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="w-full gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 text-xs transition-all duration-200"
          >
            <Plus className="w-2.5 h-2.5" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}

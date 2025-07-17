import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Edit3, Trash2, Plus } from 'lucide-react';
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
import TaskListItem from './TaskListItem';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { sectionConfirmations } from '../../utils/confirmation-configs';

interface ListSectionProps {
  section: Section;
  tasks: Task[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEdit: (task: Task) => void;
  isUnsorted?: boolean;
}

export default function ListSection({
  section,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  isUnsorted = false,
}: ListSectionProps) {
  const { dispatch } = useTask();
  const { showConfirmation } = useConfirmation();
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
    if (!isUnsorted) {
      const confirmationConfig = sectionConfirmations.deleteSection(section.name, tasks.length);

      showConfirmation({
        ...confirmationConfig,
        onConfirm: () => {
          dispatch({ type: 'DELETE_SECTION', payload: section.id });
        }
      });
    }
  };

  const handleAddTask = () => {
    dispatch({
      type: 'OPEN_TASK_MODAL',
      payload: { sectionId: isUnsorted ? null : section.id }
    });
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2 flex-1">
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Section Name */}
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                onBlur={handleSaveEdit}
                className="h-8 text-sm font-medium"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <h3
                className="text-base font-semibold text-foreground cursor-pointer"
                onClick={() => !isUnsorted && setIsEditing(true)}
              >
                {section.name}
              </h3>
              
              {/* Task Count Badge */}
              <Badge variant="secondary" className="text-xs">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
              
              {/* Completed Count */}
              {completedCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{tasks.length} completed
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Section Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={handleAddTask}
            >
              <Plus className="w-3 h-3" />
            </Button>
            
            {!isUnsorted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6"
                  >
                    <MoreHorizontal className="w-3 h-3" />
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

      {/* Tasks */}
      {!isCollapsed && (
        <div className="ml-6 space-y-3">
          {tasks.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No tasks in this section
            </div>
          ) : (
            tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onEdit={onEdit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

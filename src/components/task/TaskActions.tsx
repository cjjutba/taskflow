import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Trash2, Flag, Calendar, Copy } from 'lucide-react';
import { useTask, Task } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { taskConfirmations } from '../../utils/confirmation-configs';

interface TaskActionsProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

export function TaskActions({ task, onEdit, className }: TaskActionsProps) {
  const { dispatch } = useTask();
  const { toast } = useToast();
  const { showConfirmation } = useConfirmation();
  const [isOpen, setIsOpen] = useState(false);

  const duplicateTask = () => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (Copy)`,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    toast({
      title: 'Task duplicated',
      description: 'A copy of the task has been created.',
    });
  };

  const handleDeleteTask = () => {
    const confirmationConfig = taskConfirmations.deleteTask(task.title);

    showConfirmation({
      ...confirmationConfig,
      onConfirm: () => {
        dispatch({ type: 'DELETE_TASK', payload: task.id });
        toast({
          title: 'Task deleted',
          description: 'The task has been removed.',
          variant: 'destructive',
        });
      }
    });
  };

  const updatePriority = (priority: 'low' | 'medium' | 'high') => {
    const updatedTask = { ...task, priority, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    toast({
      title: 'Priority updated',
      description: `Task priority set to ${priority}.`,
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`p-1 h-6 w-6 ${className}`}>
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Task
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={duplicateTask}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate Task
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => updatePriority('high')}>
          <Flag className="w-4 h-4 mr-2 text-warning" />
          High Priority
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => updatePriority('medium')}>
          <Flag className="w-4 h-4 mr-2 text-primary" />
          Medium Priority
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => updatePriority('low')}>
          <Flag className="w-4 h-4 mr-2 text-muted-foreground" />
          Low Priority
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleDeleteTask}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, FolderOpen, AlertCircle } from 'lucide-react';
import { useTask, Task, Project } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from '../hooks/use-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export default function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { state, dispatch } = useTask();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    projectId: '',
  });
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
          projectId: task.projectId || '',
        });
      } else {
        // Set default values for new task
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: today,
          projectId: state.filters.project || '',
        });
      }
      setErrors({});
    }
  }, [task, isOpen, state.filters.project]);

  const validateForm = (): boolean => {
    const newErrors: {title?: string; dueDate?: string} = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validate due date if provided
    if (formData.dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dueDate)) {
        newErrors.dueDate = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        projectId: formData.projectId || null,
        completed: task?.completed || false,
      };

      if (isEditing && task) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            ...task,
            ...taskData,
            updatedAt: new Date(),
          },
        });
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your task.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      case 'low': return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[75vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Task Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title..."
              className={`text-sm ${errors.title ? 'border-destructive focus:border-destructive' : ''}`}
              required
              autoFocus={!isEditing}
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="resize-none text-sm min-h-[60px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Priority
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handleChange('priority', priority)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border text-xs font-medium transition-colors ${
                    formData.priority === priority
                      ? getPriorityColor(priority)
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="capitalize">{priority}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
              Due Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`pl-10 text-sm ${errors.dueDate ? 'border-destructive focus:border-destructive' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.dueDate && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.dueDate}</span>
              </div>
            )}
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <Label htmlFor="project" className="text-sm font-medium text-foreground">
              Project
            </Label>
            <Select
              value={formData.projectId || "none"}
              onValueChange={(value) => handleChange('projectId', value === "none" ? "" : value)}
            >
              <SelectTrigger id="project" className="w-full text-sm">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border shadow-lg">
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span>No Project</span>
                  </div>
                </SelectItem>
                {state.projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-sm"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
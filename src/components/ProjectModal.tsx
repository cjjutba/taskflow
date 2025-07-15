import React, { useState, useEffect } from 'react';
import { X, FolderOpen, AlertCircle } from 'lucide-react';
import { useTask, Project } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const projectColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { state, dispatch } = useTask();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    color: projectColors[0],
  });
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!project;

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name,
          color: project.color,
        });
      } else {
        setFormData({
          name: '',
          color: projectColors[0],
        });
      }
      setErrors({});
    }
  }, [project, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: {name?: string} = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Project name must be less than 50 characters';
    } else if (
      state.projects.some(
        p => p.name.toLowerCase() === formData.name.trim().toLowerCase() && 
        (!project || p.id !== project.id)
      )
    ) {
      newErrors.name = 'A project with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        color: formData.color,
      };

      if (isEditing && project) {
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: {
            ...project,
            ...projectData,
            updatedAt: new Date(),
          },
        });
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });
      } else {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: 'ADD_PROJECT', payload: newProject });
        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your project.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Project Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name..."
              className={`text-sm ${errors.name ? 'border-destructive focus:border-destructive' : ''}`}
              required
              autoFocus={!isEditing}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Project Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {projectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-foreground scale-110'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Project' : 'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

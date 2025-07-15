import React, { useState } from 'react';
import { MoreHorizontal, Edit3, Trash2, FolderOpen } from 'lucide-react';
import { useTask, Project } from '../contexts/TaskContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useToast } from '../hooks/use-toast';

interface ProjectActionsProps {
  project: Project;
  onEdit: (project: Project) => void;
  className?: string;
}

export function ProjectActions({ project, onEdit, className }: ProjectActionsProps) {
  const { state, dispatch } = useTask();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteProject = () => {
    // First, remove project association from all tasks
    const tasksToUpdate = state.tasks.filter(task => task.projectId === project.id);
    tasksToUpdate.forEach(task => {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          projectId: null,
          updatedAt: new Date(),
        },
      });
    });

    // Then delete the project
    dispatch({ type: 'DELETE_PROJECT', payload: project.id });
    
    toast({
      title: 'Project deleted',
      description: `"${project.name}" has been deleted and tasks moved to Inbox.`,
      variant: 'destructive',
    });
    
    setShowDeleteDialog(false);
  };

  const taskCount = state.tasks.filter(task => task.projectId === project.id).length;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 h-auto w-auto min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-0 hover:bg-transparent ${isOpen ? 'opacity-100' : ''} ${className}`}
          >
            <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg">
          <DropdownMenuItem onClick={() => onEdit(project)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Project
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              dispatch({
                type: 'SET_FILTER',
                payload: { key: 'project', value: project.id }
              });
              dispatch({
                type: 'SET_UI',
                payload: { key: 'activeView', value: 'all' }
              });
            }}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            View Tasks ({taskCount})
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
              {taskCount > 0 && (
                <span className="block mt-2 text-sm">
                  {taskCount} task{taskCount > 1 ? 's' : ''} will be moved to your Inbox.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

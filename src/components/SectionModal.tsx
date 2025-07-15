import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTask, Section } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSection?: Section | null;
}

export default function SectionModal({ isOpen, onClose, editingSection }: SectionModalProps) {
  const { state, dispatch } = useTask();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const isEditing = !!editingSection;

  useEffect(() => {
    if (isOpen) {
      if (editingSection) {
        setName(editingSection.name);
        setColor(editingSection.color || '#3b82f6');
      } else {
        setName('');
        setColor('#3b82f6');
      }
    }
  }, [isOpen, editingSection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    if (isEditing && editingSection) {
      // Update existing section
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          ...editingSection,
          name: name.trim(),
          color,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new section
      // Get the highest order value for sections in this view and add 1
      // Start from order 1 since unsorted section uses order 0
      const viewSections = state.sections.filter(s => s.viewId === state.ui.activeView);
      const maxOrder = viewSections.length > 0 ? Math.max(...viewSections.map(s => s.order)) : 0;

      const newSection: Section = {
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        color,
        order: maxOrder + 1,
        viewId: state.ui.activeView,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({
        type: 'ADD_SECTION',
        payload: newSection,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setColor('#3b82f6');
    onClose();
  };

  const colorOptions = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
  ];

  const sectionTemplates = [
    { name: 'To Do', color: '#6b7280' },
    { name: 'In Progress', color: '#f59e0b' },
    { name: 'Review', color: '#8b5cf6' },
    { name: 'Done', color: '#10b981' },
    { name: 'Backlog', color: '#3b82f6' },
    { name: 'Testing', color: '#ec4899' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Section' : 'Create New Section'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Templates */}
          {!isEditing && (
            <div className="space-y-3">
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {sectionTemplates.map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setName(template.name);
                      setColor(template.color);
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: template.color }}
                    />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Section Name */}
          <div className="space-y-2">
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter section name..."
              className="w-full"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption
                      ? 'border-foreground scale-110'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
            >
              {isEditing ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

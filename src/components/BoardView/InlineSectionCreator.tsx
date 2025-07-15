import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useTask, Section } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface InlineSectionCreatorProps {
  onCancel?: () => void;
  className?: string;
}

const SECTION_COLORS = [
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

const SECTION_TEMPLATES = [
  { name: 'To Do', color: '#6b7280' },
  { name: 'In Progress', color: '#f59e0b' },
  { name: 'Review', color: '#8b5cf6' },
  { name: 'Done', color: '#10b981' },
  { name: 'Backlog', color: '#3b82f6' },
  { name: 'Testing', color: '#ec4899' },
];

export default function InlineSectionCreator({ onCancel, className }: InlineSectionCreatorProps) {
  const { state, dispatch } = useTask();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SECTION_COLORS[0]);
  const [showTemplates, setShowTemplates] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    // Get the highest order value for sections in this view and add 1
    // Start from order 1 since unsorted section uses order 0
    const viewSections = state.sections.filter(s => s.viewId === state.ui.activeView);
    const maxOrder = viewSections.length > 0 ? Math.max(...viewSections.map(s => s.order)) : 0;

    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color: selectedColor,
      order: maxOrder + 1,
      viewId: state.ui.activeView,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({
      type: 'ADD_SECTION',
      payload: newSection,
    });

    // Reset form
    setName('');
    setSelectedColor(SECTION_COLORS[0]);
    setShowTemplates(true);
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleCancel = () => {
    setName('');
    setSelectedColor(SECTION_COLORS[0]);
    setShowTemplates(true);
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleTemplateSelect = (template: typeof SECTION_TEMPLATES[0]) => {
    setName(template.name);
    setSelectedColor(template.color);
    setShowTemplates(false);
  };

  return (
    <div className={cn('flex-shrink-0 w-64 bg-white rounded-lg border-2 border-dashed border-primary/30 p-3', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Add Section</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={handleCancel}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick templates:</p>
            <div className="grid grid-cols-2 gap-1">
              {SECTION_TEMPLATES.map((template) => (
                <Button
                  key={template.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-8 text-xs"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: template.color }}
                  />
                  {template.name}
                </Button>
              ))}
            </div>
            <div className="border-t border-border pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => setShowTemplates(false)}
              >
                Create custom section
              </Button>
            </div>
          </div>
        )}

        {/* Custom Section Form */}
        {!showTemplates && (
          <>
            {/* Section Name */}
            <div className="space-y-2">
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Section name..."
                className="h-8 text-sm"
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Color:</p>
              <div className="flex flex-wrap gap-1">
                {SECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      selectedColor === color
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
                className="text-xs"
              >
                Templates
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!name.trim()}
                className="gap-1 text-xs"
              >
                <Check className="w-3 h-3" />
                Create
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

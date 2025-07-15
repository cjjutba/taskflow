import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '../../contexts/TaskContext';

interface DraggableSectionProps {
  section: Section;
  children: React.ReactNode;
}

export default function DraggableSection({ section, children }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `section-drag-${section.id}`,
    data: {
      type: 'section',
      section,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  // Apply drag listeners to grip handles only
  React.useEffect(() => {
    const sectionElement = document.querySelector(`[data-section-id="${section.id}"]`);
    const gripHandle = sectionElement?.querySelector('.section-drag-handle');

    if (gripHandle && listeners) {
      // Apply listeners to the grip handle
      Object.entries(listeners).forEach(([eventName, handler]) => {
        const event = eventName.replace('on', '').toLowerCase();
        gripHandle.addEventListener(event, handler as EventListener);
      });

      // Apply attributes to the grip handle
      Object.entries(attributes || {}).forEach(([attr, value]) => {
        gripHandle.setAttribute(attr, value as string);
      });

      return () => {
        Object.entries(listeners).forEach(([eventName, handler]) => {
          const event = eventName.replace('on', '').toLowerCase();
          gripHandle.removeEventListener(event, handler as EventListener);
        });
      };
    }
  }, [listeners, attributes, section.id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50' : ''}`}
      data-section-id={section.id}
    >
      {children}
    </div>
  );
}

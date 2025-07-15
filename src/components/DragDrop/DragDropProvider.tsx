import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTask } from '../../contexts/TaskContext';
import BoardTaskCard from '../BoardView/BoardTaskCard';

interface DragDropProviderProps {
  children: React.ReactNode;
}

export default function DragDropProvider({ children }: DragDropProviderProps) {
  const { state, dispatch } = useTask();
  const [activeTask, setActiveTask] = React.useState<any>(null);
  const [activeSection, setActiveSection] = React.useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to start drag
        tolerance: 8, // 8px tolerance for touch movement
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Check if dragging a section
    if (active.id.toString().startsWith('section-drag-')) {
      const sectionId = active.id.toString().replace('section-drag-', '');
      const section = state.sections.find(s => s.id === sectionId);
      setActiveSection(section);
      return;
    }

    // Otherwise it's a task
    const task = state.tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle section reordering
    if (activeId.startsWith('section-drag-')) {
      return; // Section reordering is handled in dragEnd
    }

    // Find the active task
    const activeTask = state.tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Handle drop indicators
    if (overId.includes('-drop-')) {
      const [sectionId, , indexStr] = overId.split('-drop-');
      const dropIndex = parseInt(indexStr);
      const newSectionId = sectionId === 'unsorted' ? null : sectionId;

      // Only update if different section or position
      if (activeTask.sectionId !== newSectionId) {
        dispatch({
          type: 'MOVE_TASK_TO_SECTION',
          payload: {
            taskId: activeId,
            sectionId: newSectionId,
            newOrder: dropIndex,
          },
        });
      }
      return;
    }

    // Check if we're dropping over a section
    if (overId.startsWith('section-') || overId === 'unsorted') {
      const newSectionId = overId === 'unsorted' ? null : overId;

      // Only update if the section is different
      if (activeTask.sectionId !== newSectionId) {
        // Get tasks in the target section to determine new order
        const targetSectionTasks = state.tasks.filter(t =>
          t.sectionId === newSectionId && t.id !== activeId
        );
        const newOrder = targetSectionTasks.length;

        dispatch({
          type: 'MOVE_TASK_TO_SECTION',
          payload: {
            taskId: activeId,
            sectionId: newSectionId,
            newOrder,
          },
        });
      }
    }
    // Check if we're dropping over another task
    else {
      const overTask = state.tasks.find(t => t.id === overId);
      if (!overTask) return;

      // If tasks are in different sections, move to the over task's section
      if (activeTask.sectionId !== overTask.sectionId) {
        dispatch({
          type: 'MOVE_TASK_TO_SECTION',
          payload: {
            taskId: activeId,
            sectionId: overTask.sectionId,
            newOrder: overTask.order,
          },
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveSection(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle section reordering
    if (activeId.startsWith('section-drag-')) {
      const activeSectionId = activeId.replace('section-drag-', '');
      const overSectionId = overId.startsWith('section-drag-')
        ? overId.replace('section-drag-', '')
        : overId;

      if (activeSectionId !== overSectionId) {
        const activeSection = state.sections.find(s => s.id === activeSectionId);
        const overSection = state.sections.find(s => s.id === overSectionId);

        if (activeSection && overSection && activeSection.viewId === overSection.viewId) {
          // Get all sections in the same view
          const viewSections = state.sections
            .filter(s => s.viewId === activeSection.viewId && s.id !== activeSectionId)
            .sort((a, b) => a.order - b.order);

          // Insert active section at over section's position
          const overIndex = viewSections.findIndex(s => s.id === overSectionId);
          viewSections.splice(overIndex, 0, activeSection);

          // Update orders for all sections
          viewSections.forEach((section, index) => {
            if (section.order !== index) {
              dispatch({
                type: 'REORDER_SECTIONS',
                payload: {
                  sectionId: section.id,
                  newOrder: index,
                },
              });
            }
          });
        }
      }
      return;
    }

    // Find the active task
    const activeTask = state.tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Handle drop indicators
    if (overId.includes('-drop-')) {
      const [sectionId, , indexStr] = overId.split('-drop-');
      const dropIndex = parseInt(indexStr);
      const newSectionId = sectionId === 'unsorted' ? null : sectionId;

      // Get all tasks in the target section (excluding the active task)
      const targetSectionTasks = state.tasks
        .filter(t => t.sectionId === newSectionId && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      // Insert the active task at the drop index
      const updatedTasks = [...targetSectionTasks];
      updatedTasks.splice(dropIndex, 0, { ...activeTask, sectionId: newSectionId });

      // Update orders for all affected tasks
      updatedTasks.forEach((task, index) => {
        if (task.id === activeId) {
          dispatch({
            type: 'MOVE_TASK_TO_SECTION',
            payload: {
              taskId: activeId,
              sectionId: newSectionId,
              newOrder: index,
            },
          });
        } else if (task.order !== index) {
          dispatch({
            type: 'REORDER_TASKS',
            payload: {
              taskId: task.id,
              newOrder: index,
              sectionId: task.sectionId,
            },
          });
        }
      });
      return;
    }

    // If dropping over another task, handle reordering
    if (!overId.startsWith('section-') && overId !== 'unsorted' && !overId.includes('-drop-')) {
      const overTask = state.tasks.find(t => t.id === overId);
      if (!overTask) return;

      // Only reorder if they're in the same section and different positions
      if (activeTask.sectionId === overTask.sectionId && activeId !== overId) {
        // Get all tasks in the same section
        const sectionTasks = state.tasks
          .filter(t => t.sectionId === activeTask.sectionId && t.id !== activeId)
          .sort((a, b) => a.order - b.order);

        // Insert the active task at the over task's position
        const overIndex = sectionTasks.findIndex(t => t.id === overId);
        sectionTasks.splice(overIndex, 0, activeTask);

        // Update orders for all tasks in the section
        sectionTasks.forEach((task, index) => {
          if (task.order !== index) {
            dispatch({
              type: 'REORDER_TASKS',
              payload: {
                taskId: task.id,
                newOrder: index,
                sectionId: task.sectionId,
              },
            });
          }
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <BoardTaskCard
              task={activeTask}
              onEdit={() => {}}
            />
          </div>
        ) : activeSection ? (
          <div className="opacity-90 scale-105">
            <div className="w-80 bg-white rounded-lg border shadow-lg p-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeSection.color }}
                />
                <h3 className="font-medium text-sm">{activeSection.name}</h3>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

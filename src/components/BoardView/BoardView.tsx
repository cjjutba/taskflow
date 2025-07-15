import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTask, Task, Section } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import BoardSection from './BoardSection';
import DragDropProvider from '../DragDrop/DragDropProvider';
import InlineSectionCreator from './InlineSectionCreator';
import DraggableSection from '../DragDrop/DraggableSection';
import BoardEmptyState from '../EmptyState/BoardEmptyState';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

interface BoardViewProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onAddSection?: () => void;
}

export default function BoardView({ tasks, onEdit, onAddSection }: BoardViewProps) {
  const { state, dispatch } = useTask();
  const [showInlineCreator, setShowInlineCreator] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group tasks by sections
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    const unsortedTasks: Task[] = [];

    // Sort sections by order
    const sortedSections = [...state.sections]
      .filter(section => section.viewId === state.ui.activeView)
      .sort((a, b) => a.order - b.order);

    // Initialize groups for existing sections
    sortedSections.forEach(section => {
      groups[section.id] = [];
    });

    // Group tasks
    tasks.forEach(task => {
      if (task.sectionId && groups[task.sectionId]) {
        groups[task.sectionId].push(task);
      } else {
        unsortedTasks.push(task);
      }
    });

    // Sort tasks within each section by order
    Object.keys(groups).forEach(sectionId => {
      groups[sectionId].sort((a, b) => a.order - b.order);
    });

    // Sort unsorted tasks by order
    unsortedTasks.sort((a, b) => a.order - b.order);

    return { groups, unsortedTasks, sortedSections };
  }, [tasks, state.sections, state.ui.activeView]);

  const handleEdit = (task: Task) => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleAddTask = (sectionId?: string) => {
    dispatch({
      type: 'OPEN_TASK_MODAL',
      payload: { sectionId: sectionId || null }
    });
  };

  const handleAddSection = () => {
    if (onAddSection) {
      onAddSection();
    } else {
      setShowInlineCreator(true);
    }
  };

  const sectionIds = groupedTasks.sortedSections.map(s => `section-drag-${s.id}`);
  const hasAnySections = groupedTasks.sortedSections.length > 0 || groupedTasks.unsortedTasks.length > 0;

  // Show empty state if no sections exist
  if (!hasAnySections) {
    return (
      <DragDropProvider>
        <BoardEmptyState onCreateSection={handleAddSection} />
      </DragDropProvider>
    );
  }

  return (
    <DragDropProvider>
      <div className="h-full w-full flex flex-col">
        {/* Board Container - Horizontal scroll within constrained width */}
        <div
          className="flex-1 overflow-x-auto overflow-y-hidden w-full cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            // Only enable dragging if clicking on the background, not on interactive elements
            const target = e.target as HTMLElement;
            const isBackground = target === e.currentTarget ||
                               target.classList.contains('board-background') ||
                               target.classList.contains('board-section-background');

            // Don't drag if clicking on task cards, buttons, or other interactive elements
            const isInteractive = target.closest('.task-card') ||
                                 target.closest('button') ||
                                 target.closest('input') ||
                                 target.closest('[role="button"]') ||
                                 target.closest('.section-drag-handle') ||
                                 target.closest('[data-sortable-item]');

            if (isBackground && !isInteractive) {
              e.preventDefault();
              const container = e.currentTarget;
              const startX = e.pageX;
              const scrollLeft = container.scrollLeft;

              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                const x = e.pageX;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                container.style.cursor = 'grab';
              };

              container.style.cursor = 'grabbing';
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }}
        >
          <div className="flex gap-4 p-4 h-full board-background" style={{ minWidth: 'max-content' }}>
            <SortableContext items={sectionIds} strategy={horizontalListSortingStrategy}>
              {/* Render unsorted tasks section first */}
              {groupedTasks.unsortedTasks.length > 0 && (
                <BoardSection
                  section={{
                    id: 'unsorted',
                    name: 'Unsorted',
                    order: 0,
                    viewId: state.ui.activeView,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }}
                  tasks={groupedTasks.unsortedTasks}
                  onEdit={handleEdit}
                  onAddTask={() => handleAddTask()}
                  isUnsorted={true}
                />
              )}

              {/* Render sections */}
              {groupedTasks.sortedSections.map(section => {
                const sectionTasks = groupedTasks.groups[section.id];

                return (
                  <DraggableSection key={section.id} section={section}>
                    <BoardSection
                      section={section}
                      tasks={sectionTasks}
                      onEdit={handleEdit}
                      onAddTask={() => handleAddTask(section.id)}
                    />
                  </DraggableSection>
                );
              })}
            </SortableContext>

          {/* Add Section Column */}
          {showInlineCreator ? (
            <InlineSectionCreator onCancel={() => setShowInlineCreator(false)} />
          ) : (
            <div className="flex-shrink-0 w-64">
              <div className="rounded-lg h-full min-h-[200px] flex flex-col items-center justify-center p-4">
                <div className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Add Section</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create a new section to organize your tasks
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSection}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                </div>
              </div>
            </div>
          )}


          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}

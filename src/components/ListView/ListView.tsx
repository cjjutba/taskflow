import React, { useMemo, useState } from 'react';
import { useTask, Task, Section } from '../../contexts/TaskContext';
import ListSection from './ListSection';
import TaskListItem from './TaskListItem';
import ListEmptyState from '../EmptyState/ListEmptyState';

interface ListViewProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onAddSection?: () => void;
}

export default function ListView({ tasks, onEdit, onAddSection }: ListViewProps) {
  const { state, dispatch } = useTask();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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

  const toggleSectionCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleEdit = (task: Task) => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleAddSection = () => {
    if (onAddSection) {
      onAddSection();
    } else {
      // Fallback to opening section modal
      dispatch({ type: 'SET_UI', payload: { key: 'sectionModalOpen', value: true } });
    }
  };

  const hasAnySections = groupedTasks.sortedSections.length > 0 || groupedTasks.unsortedTasks.length > 0;

  // Show empty state if no sections exist
  if (!hasAnySections) {
    return (
      <div className="h-full w-full">
        <ListEmptyState onCreateSection={handleAddSection} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Render unsorted tasks first */}
      {groupedTasks.unsortedTasks.length > 0 && (
        <ListSection
          section={{
            id: 'unsorted',
            name: 'Unsorted',
            order: 0,
            viewId: state.ui.activeView,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          tasks={groupedTasks.unsortedTasks}
          isCollapsed={collapsedSections.has('unsorted')}
          onToggleCollapse={() => toggleSectionCollapse('unsorted')}
          onEdit={handleEdit}
          isUnsorted={true}
        />
      )}

      {/* Render sections */}
      {groupedTasks.sortedSections.map(section => {
        const sectionTasks = groupedTasks.groups[section.id];
        const isCollapsed = collapsedSections.has(section.id);

        return (
          <ListSection
            key={section.id}
            section={section}
            tasks={sectionTasks}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => toggleSectionCollapse(section.id)}
            onEdit={handleEdit}
          />
        );
      })}
    </div>
  );
}

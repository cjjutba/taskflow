import React, { useMemo } from 'react';
import { useTask } from '../../contexts/TaskContext';
import TaskList from '../TaskList';

export default function InboxView() {
  const { state } = useTask();

  const inboxTasks = useMemo(() => {
    return state.tasks.filter(task => !task.projectId);
  }, [state.tasks]);

  return (
    <TaskList 
      title="Inbox" 
      tasks={inboxTasks}
      showAddButton={true}
    />
  );
}
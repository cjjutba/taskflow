import React, { useMemo } from 'react';
import { useTask } from '../../contexts/TaskContext';
import TaskList from '../TaskList';

export default function CompletedView() {
  const { state } = useTask();

  const completedTasks = useMemo(() => {
    return state.tasks.filter(task => task.completed);
  }, [state.tasks]);

  return (
    <TaskList 
      title="Completed Tasks" 
      tasks={completedTasks}
      showAddButton={false}
    />
  );
}
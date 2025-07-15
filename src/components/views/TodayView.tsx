import React, { useMemo } from 'react';
import { useTask } from '../../contexts/TaskContext';
import TaskList from '../TaskList';

export default function TodayView() {
  const { state } = useTask();

  const todayTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return state.tasks.filter(task => 
      task.dueDate && 
      task.dueDate >= today && 
      task.dueDate < tomorrow
    );
  }, [state.tasks]);

  return (
    <TaskList 
      title="Today" 
      tasks={todayTasks}
      showAddButton={true}
    />
  );
}
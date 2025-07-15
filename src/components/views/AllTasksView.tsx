import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import TaskList from '../TaskList';

export default function AllTasksView() {
  const { state } = useTask();

  return (
    <TaskList 
      title="All Tasks" 
      tasks={state.tasks}
      showAddButton={true}
    />
  );
}
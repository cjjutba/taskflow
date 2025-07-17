import { useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { createNotificationFromTemplate } from '../utils/notificationTemplates';
import { Task, Project, Section } from '../contexts/TaskContext';

interface UseTaskNotificationsProps {
  tasks: Task[];
  projects: Project[];
  sections: Section[];
}

export const useTaskNotifications = ({ tasks, projects, sections }: UseTaskNotificationsProps) => {
  const { addNotification, settings } = useNotification();
  const previousTasksRef = useRef<Task[]>([]);
  const previousProjectsRef = useRef<Project[]>([]);
  const previousSectionsRef = useRef<Section[]>([]);

  // Check for task changes and generate notifications
  useEffect(() => {
    const previousTasks = previousTasksRef.current;

    if (previousTasks.length === 0) {
      // First load, just store the current tasks
      previousTasksRef.current = [...tasks];
      return;
    }

    // Check for new tasks
    const newTasks = tasks.filter(task =>
      !previousTasks.find(prevTask => prevTask.id === task.id)
    );

    newTasks.forEach(task => {
      if (settings.taskCreated) {
        addNotification(createNotificationFromTemplate('TASK_CREATED', {
          taskTitle: task.title,
          relatedEntityId: task.id,
          relatedEntityType: 'task'
        }));
      }
    });

    // Check for completed tasks
    const completedTasks = tasks.filter(task => {
      const prevTask = previousTasks.find(prevTask => prevTask.id === task.id);
      return prevTask && !prevTask.completed && task.completed;
    });

    completedTasks.forEach(task => {
      if (settings.taskCompleted) {
        addNotification(createNotificationFromTemplate('TASK_COMPLETED', {
          taskTitle: task.title,
          relatedEntityId: task.id,
          relatedEntityType: 'task'
        }));
      }
    });

    // Check for updated tasks
    const updatedTasks = tasks.filter(task => {
      const prevTask = previousTasks.find(prevTask => prevTask.id === task.id);
      return prevTask &&
             prevTask.updatedAt.getTime() !== task.updatedAt.getTime() &&
             prevTask.completed === task.completed; // Exclude completion changes (handled above)
    });

    updatedTasks.forEach(task => {
      if (settings.taskUpdated) {
        addNotification(createNotificationFromTemplate('TASK_UPDATED', {
          taskTitle: task.title,
          relatedEntityId: task.id,
          relatedEntityType: 'task'
        }));
      }
    });

    // Check for deleted tasks
    const deletedTasks = previousTasks.filter(prevTask =>
      !tasks.find(task => task.id === prevTask.id)
    );

    deletedTasks.forEach(task => {
      if (settings.taskDeleted) {
        addNotification(createNotificationFromTemplate('TASK_DELETED', {
          taskTitle: task.title,
          relatedEntityId: task.id,
          relatedEntityType: 'task'
        }));
      }
    });

    // Update the reference
    previousTasksRef.current = [...tasks];
  }, [tasks, settings, addNotification]);

  // Check for project changes
  useEffect(() => {
    const previousProjects = previousProjectsRef.current;

    if (previousProjects.length === 0) {
      previousProjectsRef.current = [...projects];
      return;
    }

    // Check for new projects
    const newProjects = projects.filter(project =>
      !previousProjects.find(prevProject => prevProject.id === project.id)
    );

    newProjects.forEach(project => {
      if (settings.projectCreated) {
        addNotification(createNotificationFromTemplate('PROJECT_CREATED', {
          projectName: project.name,
          relatedEntityId: project.id,
          relatedEntityType: 'project'
        }));
      }
    });

    // Check for updated projects
    const updatedProjects = projects.filter(project => {
      const prevProject = previousProjects.find(p => p.id === project.id);
      return prevProject && prevProject.name !== project.name;
    });

    updatedProjects.forEach(project => {
      if (settings.projectUpdated) {
        addNotification(createNotificationFromTemplate('PROJECT_UPDATED', {
          projectName: project.name,
          relatedEntityId: project.id,
          relatedEntityType: 'project'
        }));
      }
    });

    // Check for deleted projects
    const deletedProjects = previousProjects.filter(prevProject =>
      !projects.find(project => project.id === prevProject.id)
    );

    deletedProjects.forEach(project => {
      if (settings.projectDeleted) {
        addNotification(createNotificationFromTemplate('PROJECT_DELETED', {
          projectName: project.name,
          relatedEntityId: project.id,
          relatedEntityType: 'project'
        }));
      }
    });

    previousProjectsRef.current = [...projects];
  }, [projects, settings, addNotification]);

  // Check for section changes
  useEffect(() => {
    const previousSections = previousSectionsRef.current;

    if (previousSections.length === 0) {
      previousSectionsRef.current = [...sections];
      return;
    }

    // Check for new sections
    const newSections = sections.filter(section =>
      !previousSections.find(prevSection => prevSection.id === section.id)
    );

    newSections.forEach(section => {
      if (settings.sectionCreated) {
        addNotification(createNotificationFromTemplate('SECTION_CREATED', {
          sectionName: section.name,
          relatedEntityId: section.id,
          relatedEntityType: 'section'
        }));
      }
    });

    // Check for updated sections
    const updatedSections = sections.filter(section => {
      const prevSection = previousSections.find(s => s.id === section.id);
      return prevSection && prevSection.name !== section.name;
    });

    updatedSections.forEach(section => {
      if (settings.sectionUpdated) {
        addNotification(createNotificationFromTemplate('SECTION_UPDATED', {
          sectionName: section.name,
          relatedEntityId: section.id,
          relatedEntityType: 'section'
        }));
      }
    });

    // Check for deleted sections
    const deletedSections = previousSections.filter(prevSection =>
      !sections.find(section => section.id === prevSection.id)
    );

    deletedSections.forEach(section => {
      if (settings.sectionDeleted) {
        addNotification(createNotificationFromTemplate('SECTION_DELETED', {
          sectionName: section.name,
          relatedEntityId: section.id,
          relatedEntityType: 'section'
        }));
      }
    });

    previousSectionsRef.current = [...sections];
  }, [sections, settings, addNotification]);
};

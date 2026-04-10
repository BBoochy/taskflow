/**
 * Pure task data model — zero DOM, zero localStorage, zero side effects.
 */

let counter = 0;

function createTask(title) {
  return {
    id: `${Date.now()}-${++counter}`,
    title,
    completed: false,
    createdAt: new Date(),
  };
}

function toggleTask(task) {
  return { ...task, completed: !task.completed };
}

function deleteTask(tasks, taskId) {
  return tasks.filter(t => t.id !== taskId);
}

function filterTasks(tasks, filter) {
  switch (filter) {
    case 'active': return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t => t.completed);
    default: return [...tasks];
  }
}

function updateTask(tasks, taskId, newTitle) {
  return tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t);
}

function clearCompleted(tasks) {
  return tasks.filter(t => !t.completed);
}

function validateTitle(title) {
  if (!title || !title.trim()) return 'Title cannot be empty';
  return true;
}

module.exports = { createTask, toggleTask, deleteTask, filterTasks, updateTask, clearCompleted, validateTitle };

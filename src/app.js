const { createTask, toggleTask, deleteTask, filterTasks, updateTask, clearCompleted, validateTitle } = require('./core');
const { loadTasks, saveTasks } = require('./storage');
const { renderApp } = require('./render');

function initApp(doc, storage) {
  let tasks = loadTasks(storage);
  let currentFilter = 'all';
  const app = doc.getElementById('app');
  const input = app.querySelector('.task-input');
  const container = app.querySelector('.task-container');

  function render() {
    const filtered = filterTasks(tasks, currentFilter);
    container.innerHTML = renderApp(filtered, currentFilter);
  }

  app.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('add-btn')) {
      addTask();
    } else if (target.type === 'checkbox') {
      const li = target.closest('.task-item');
      if (!li) return;
      tasks = tasks.map(t => t.id === li.dataset.id ? toggleTask(t) : t);
      saveTasks(storage, tasks);
      render();
    } else if (target.dataset.action === 'delete') {
      const li = target.closest('.task-item');
      if (!li) return;
      tasks = deleteTask(tasks, li.dataset.id);
      saveTasks(storage, tasks);
      render();
    } else if (target.classList.contains('clear-completed')) {
      tasks = clearCompleted(tasks);
      saveTasks(storage, tasks);
      render();
    } else if (target.dataset.filter) {
      currentFilter = target.dataset.filter;
      render();
    }
  });

  function addTask() {
    const title = input.value.trim();
    if (validateTitle(title) !== true) return;
    tasks = [...tasks, createTask(title)];
    saveTasks(storage, tasks);
    input.value = '';
    render();
    input.focus();
  }

  app.addEventListener('dblclick', (e) => {
    const target = e.target;
    if (target.classList.contains('task-title')) {
      const li = target.closest('.task-item');
      if (!li) return;
      tasks = tasks.map(t => t.id === li.dataset.id ? { ...t, editing: true } : t);
      render();
    }
  });

  app.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target === input && e.key === 'Enter') {
      addTask();
      return;
    }
    if (target.classList.contains('edit-input')) {
      const li = target.closest('.task-item');
      if (!li) return;
      if (e.key === 'Enter') {
        const newTitle = target.value.trim();
        if (newTitle) {
          tasks = updateTask(tasks, li.dataset.id, newTitle);
          tasks = tasks.map(t => t.id === li.dataset.id ? { ...t, editing: false } : t);
          saveTasks(storage, tasks);
        }
        render();
      } else if (e.key === 'Escape') {
        tasks = tasks.map(t => t.id === li.dataset.id ? { ...t, editing: false } : t);
        render();
      }
    }
  });

  app.addEventListener('focusout', (e) => {
    const target = e.target;
    if (target.classList.contains('edit-input')) {
      const li = target.closest('.task-item');
      if (!li) return;
      const newTitle = target.value.trim();
      if (newTitle) {
        tasks = updateTask(tasks, li.dataset.id, newTitle);
      }
      tasks = tasks.map(t => t.id === li.dataset.id ? { ...t, editing: false } : t);
      saveTasks(storage, tasks);
      render();
    }
  });

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp(document, localStorage);
  });
}

module.exports = { initApp };

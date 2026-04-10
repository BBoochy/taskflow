/**
 * localStorage storage adapter — the IO boundary.
 * Only this file touches localStorage directly.
 */

const STORAGE_KEY = 'taskflow-tasks';

function loadTasks(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

module.exports = { loadTasks, saveTasks };

const { LocalStorageMock } = require('../mocks/localStorage');
const { loadTasks, saveTasks } = require('../../src/storage');

const STORAGE_KEY = 'taskflow-tasks';

describe('storage adapter', () => {
  let storage;

  beforeEach(() => {
    storage = new LocalStorageMock();
  });

  test('loadTasks returns empty array when nothing stored', () => {
    expect(loadTasks(storage)).toEqual([]);
  });

  test('saveTasks writes and loadTasks reads back', () => {
    const tasks = [
      { id: '1', title: 'Test', completed: false, createdAt: '2026-01-01T00:00:00.000Z' },
    ];
    saveTasks(storage, tasks);
    const loaded = loadTasks(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Test');
  });

  test('loadTasks returns empty array on corrupted JSON', () => {
    storage.setItem(STORAGE_KEY, '{not valid json!!!');
    expect(loadTasks(storage)).toEqual([]);
  });

  test('saveTasks serializes to JSON string', () => {
    const tasks = [{ id: '1', title: 'A', completed: true, createdAt: '2026-01-01T00:00:00.000Z' }];
    saveTasks(storage, tasks);
    const raw = storage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw)).toEqual(tasks);
  });

  test('loadTasks returns empty array for null storage value', () => {
    expect(loadTasks(storage)).toEqual([]);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});

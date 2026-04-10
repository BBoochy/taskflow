const { createTask, toggleTask, deleteTask, filterTasks, updateTask, clearCompleted, validateTitle } = require('../../src/core');

describe('createTask', () => {
  test('returns task with correct shape and unique ids', () => {
    const a = createTask('Buy groceries');
    const b = createTask('Clean house');
    expect(a).toEqual(expect.objectContaining({ title: 'Buy groceries', completed: false }));
    expect(typeof a.id).toBe('string');
    expect(a.createdAt).toBeInstanceOf(Date);
    expect(a.id).not.toBe(b.id);
  });
});

describe('toggleTask', () => {
  test('flips completed and returns new object', () => {
    const task = createTask('Test');
    const toggled = toggleTask(task);
    expect(toggled.completed).toBe(true);
    expect(toggleTask(toggled).completed).toBe(false);
    expect(toggled).not.toBe(task);
  });
});

describe('deleteTask', () => {
  test('removes task by id and returns new array', () => {
    const tasks = [createTask('A'), createTask('B'), createTask('C')];
    const result = deleteTask(tasks, tasks[1].id);
    expect(result).toHaveLength(2);
    expect(result.find(t => t.id === tasks[1].id)).toBeUndefined();
    expect(result).not.toBe(tasks);
  });
});

describe('filterTasks', () => {
  const tasks = [
    { id: '1', title: 'A', completed: false, createdAt: new Date() },
    { id: '2', title: 'B', completed: true, createdAt: new Date() },
    { id: '3', title: 'C', completed: false, createdAt: new Date() },
  ];
  test('all returns every task', () => expect(filterTasks(tasks, 'all')).toHaveLength(3));
  test('active returns incomplete', () => expect(filterTasks(tasks, 'active')).toHaveLength(2));
  test('completed returns done', () => expect(filterTasks(tasks, 'completed')).toHaveLength(1));
});

describe('updateTask', () => {
  test('updates title by id, returns new array, no-op for missing id', () => {
    const tasks = [createTask('Old'), createTask('Other')];
    const result = updateTask(tasks, tasks[0].id, 'New');
    expect(result[0].title).toBe('New');
    expect(result).not.toBe(tasks);
    expect(updateTask(tasks, 'x', 'B')[0].title).toBe('Old');
  });
});

describe('clearCompleted', () => {
  test('removes completed tasks and returns new array', () => {
    const done = { id: '1', title: 'A', completed: true, createdAt: new Date() };
    const active = { id: '2', title: 'B', completed: false, createdAt: new Date() };
    const result = clearCompleted([done, active]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('B');
  });
});

describe('validateTitle', () => {
  test('rejects empty string', () => {
    expect(validateTitle('')).toBe('Title cannot be empty');
  });
  test('rejects whitespace-only string', () => {
    expect(validateTitle('   ')).toBe('Title cannot be empty');
  });
  test('returns true for valid title', () => {
    expect(validateTitle('Buy groceries')).toBe(true);
  });
  test('trims whitespace and validates', () => {
    expect(validateTitle('  Hello  ')).toBe(true);
  });
});

const { createTask, toggleTask, deleteTask, filterTasks } = require('../../src/core');

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
  test('active returns incomplete', () => {
    const result = filterTasks(tasks, 'active');
    expect(result).toHaveLength(2);
    expect(result.every(t => !t.completed)).toBe(true);
  });
  test('completed returns done', () => {
    const result = filterTasks(tasks, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });
});

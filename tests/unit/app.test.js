const { initApp } = require('../../src/app');

function makeStorage(initial) {
  const store = initial ? { 'taskflow-tasks': JSON.stringify(initial) } : {};
  return { getItem: jest.fn(k => store[k] || null), setItem: jest.fn((k, v) => { store[k] = v; }) };
}
function makeDoc() {
  const listeners = {}, input = { value: '', focus: jest.fn(), classList: { contains: () => false } }, container = { innerHTML: '' };
  const app = {
    addEventListener: jest.fn((evt, h) => { listeners[evt] = h; }),
    querySelector: jest.fn(s => s === '.task-input' ? input : s === '.task-container' ? container : null),
  };
  return { getElementById: jest.fn(() => app), _app: app, _input: input, _container: container, _listeners: listeners };
}
function ev(t) {
  return { target: { classList: { contains: () => false }, type: '', dataset: {}, closest: () => null, ...t } };
}

describe('App Controller', () => {
  let doc, storage;
  beforeEach(() => { doc = makeDoc(); storage = makeStorage(); });

  test('event delegation: registers event listeners on #app', () => {
    initApp(doc, storage);
    expect(doc._app.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(doc._app.addEventListener).toHaveBeenCalledWith('dblclick', expect.any(Function));
    expect(doc._app.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(doc._app.addEventListener).toHaveBeenCalledWith('focusout', expect.any(Function));
  });
  test('onLoad: loads tasks from storage and renders', () => {
    storage = makeStorage([{ id: '1', title: 'Loaded', completed: false, createdAt: '2026-01-01' }]);
    initApp(doc, storage);
    expect(storage.getItem).toHaveBeenCalledWith('taskflow-tasks');
    expect(doc._container.innerHTML).toContain('Loaded');
  });
  test('onLoad: renders empty state when no tasks', () => {
    initApp(doc, storage);
    expect(doc._container.innerHTML).toContain('No tasks yet');
  });
  test('addTask: creates, saves, re-renders, clears input', () => {
    initApp(doc, storage);
    doc._input.value = 'Buy milk';
    doc._listeners.click(ev({ classList: { contains: c => c === 'add-btn' } }));
    expect(doc._container.innerHTML).toContain('Buy milk');
    expect(storage.setItem).toHaveBeenCalled();
    expect(doc._input.value).toBe('');
  });
  test('addTask: ignores empty input', () => {
    initApp(doc, storage);
    doc._input.value = '  ';
    doc._listeners.click(ev({ classList: { contains: c => c === 'add-btn' } }));
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  test('toggleTask: toggles completion and saves', () => {
    storage = makeStorage([{ id: 't1', title: 'T', completed: false, createdAt: '2026-01-01' }]);
    initApp(doc, storage);
    storage.setItem.mockClear();
    doc._listeners.click(ev({ type: 'checkbox', closest: () => ({ dataset: { id: 't1' } }) }));
    expect(JSON.parse(storage.setItem.mock.calls[0][1])[0].completed).toBe(true);
  });
  test('deleteTask: removes task and saves', () => {
    storage = makeStorage([{ id: 'd1', title: 'D', completed: false, createdAt: '2026-01-01' }]);
    initApp(doc, storage);
    storage.setItem.mockClear();
    doc._listeners.click(ev({ dataset: { action: 'delete' }, closest: () => ({ dataset: { id: 'd1' } }) }));
    expect(JSON.parse(storage.setItem.mock.calls[0][1])).toHaveLength(0);
  });
  test('filterTasks: re-renders without saving', () => {
    storage = makeStorage([
      { id: '1', title: 'Active', completed: false, createdAt: '2026-01-01' },
      { id: '2', title: 'Done', completed: true, createdAt: '2026-01-01' },
    ]);
    initApp(doc, storage);
    storage.setItem.mockClear();
    doc._listeners.click(ev({ dataset: { filter: 'active' } }));
    expect(doc._container.innerHTML).toContain('Active');
    expect(doc._container.innerHTML).not.toContain('Done');
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test('clearCompleted: removes completed tasks and saves', () => {
    storage = makeStorage([
      { id: 'c1', title: 'Done', completed: true, createdAt: '2026-01-01' },
      { id: 'c2', title: 'Active', completed: false, createdAt: '2026-01-01' },
    ]);
    initApp(doc, storage);
    storage.setItem.mockClear();
    doc._listeners.click(ev({ classList: { contains: c => c === 'clear-completed' } }));
    const saved = JSON.parse(storage.setItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe('Active');
  });

  test('dblclick: enters edit mode on task title', () => {
    storage = makeStorage([{ id: 'e1', title: 'Edit me', completed: false, createdAt: '2026-01-01' }]);
    initApp(doc, storage);
    doc._listeners.dblclick(ev({ classList: { contains: c => c === 'task-title' }, closest: () => ({ dataset: { id: 'e1' } }) }));
    expect(doc._container.innerHTML).toContain('edit-input');
  });

  test('addTask: rejects empty title after trim (validation)', () => {
    initApp(doc, storage);
    doc._input.value = '   ';
    doc._listeners.click(ev({ classList: { contains: c => c === 'add-btn' } }));
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test('keydown Enter on task-input adds task', () => {
    initApp(doc, storage);
    doc._input.value = 'Keyboard task';
    doc._listeners.keydown({ target: doc._input, key: 'Enter', preventDefault: jest.fn() });
    expect(doc._container.innerHTML).toContain('Keyboard task');
    expect(storage.setItem).toHaveBeenCalled();
  });

  test('renders empty state message when no tasks', () => {
    initApp(doc, storage);
    expect(doc._container.innerHTML).toContain('No tasks yet');
  });
});

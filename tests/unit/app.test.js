const { initApp } = require('../../src/app');

function makeStorage(initial) {
  const store = initial ? { 'taskflow-tasks': JSON.stringify(initial) } : {};
  return { getItem: jest.fn(k => store[k] || null), setItem: jest.fn((k, v) => { store[k] = v; }) };
}
function makeDoc() {
  const listeners = {}, input = { value: '' }, container = { innerHTML: '' };
  const app = {
    addEventListener: jest.fn((t, h) => { listeners[t] = h; }),
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

  test('event delegation: single click listener on #app', () => {
    initApp(doc, storage);
    expect(doc._app.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(doc._app.addEventListener).toHaveBeenCalledTimes(1);
  });
  test('onLoad: loads tasks from storage and renders', () => {
    storage = makeStorage([{ id: '1', title: 'Loaded', completed: false, createdAt: '2026-01-01' }]);
    initApp(doc, storage);
    expect(storage.getItem).toHaveBeenCalledWith('taskflow-tasks');
    expect(doc._container.innerHTML).toContain('Loaded');
  });
  test('onLoad: renders empty list when no tasks', () => {
    initApp(doc, storage);
    expect(doc._container.innerHTML).toContain('task-list');
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
});

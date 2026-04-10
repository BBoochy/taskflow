const { createTask } = require('../../src/core');
const { renderTask, renderTaskList, renderApp } = require('../../src/render');

describe('renderTask', () => {
  it('renders title, checkbox, delete button, date, and data-id', () => {
    const task = createTask('Buy groceries');
    const html = renderTask(task);
    expect(html).toContain('Buy groceries');
    expect(html).toContain('<input');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('delete');
    expect(html).toContain(`data-id="${task.id}"`);
    expect(html).toContain('class="task-date"');
  });

  it('marks completed tasks with checked attribute', () => {
    const task = { ...createTask('Done'), completed: true };
    const html = renderTask(task);
    expect(html).toContain('checked');
  });
});

describe('renderTaskList', () => {
  it('wraps tasks in ul with li items, empty when no tasks', () => {
    const tasks = [createTask('Task 1'), createTask('Task 2')];
    const html = renderTaskList(tasks);
    expect(html).toContain('<ul');
    expect(html).toContain('Task 1');
    expect(html).toContain('Task 2');
    expect((html.match(/<li/g) || []).length).toBe(2);
    expect(renderTaskList([])).not.toContain('<li');
  });
});

describe('renderApp', () => {
  it('renders task list with filter controls and count', () => {
    const tasks = [createTask('One'), createTask('Two')];
    const html = renderApp(tasks, 'all');
    expect(html).toContain('One');
    expect(html).toContain('All');
    expect(html).toContain('Active');
    expect(html).toContain('Completed');
    expect(html).toContain('2');
  });

  it('marks the active filter button', () => {
    const html = renderApp([], 'active');
    expect(html).toContain('data-filter="active"');
    expect(html).toMatch(/data-filter="active"[^>]*class="[^"]*active/);
  });
});

const { createTask } = require('../../src/core');
const { renderTask, renderTaskList, renderApp } = require('../../src/render');

describe('renderTask', () => {
  it('renders task with checkbox, title, date, delete, data-id, and ARIA', () => {
    const task = createTask('Buy groceries');
    const html = renderTask(task);
    expect(html).toContain('Buy groceries');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain(`data-id="${task.id}"`);
    expect(html).toContain('class="task-date"');
    expect(html).toContain('aria-label=');
    expect(html).toContain('role=');
  });
  it('marks completed tasks and renders edit mode', () => {
    expect(renderTask({ ...createTask('D'), completed: true })).toContain('checked');
    expect(renderTask({ ...createTask('E'), editing: true })).toContain('edit-input');
    expect(renderTask(createTask('N'))).not.toContain('edit-input');
  });
});

describe('renderTaskList', () => {
  it('wraps tasks in semantic ul, shows empty state when no tasks', () => {
    const html = renderTaskList([createTask('T1'), createTask('T2')]);
    expect(html).toContain('<ul');
    expect(html).toContain('role="list"');
    expect((html.match(/<li/g) || []).length).toBe(2);
    expect(renderTaskList([])).toContain('No tasks yet');
  });
});

describe('renderApp', () => {
  it('renders filters, count, clear-completed, and active button', () => {
    const html = renderApp([createTask('One'), createTask('Two')], 'all');
    expect(html).toContain('One');
    expect(html).toContain('All');
    expect(html).toContain('Active');
    expect(html).toContain('clear-completed');
    const active = renderApp([], 'active');
    expect(active).toMatch(/data-filter="active"[^>]*class="[^"]*active/);
  });
  it('renders empty state message when no tasks', () => {
    const html = renderApp([], 'all');
    expect(html).toContain('No tasks yet');
    expect(html).toContain('add one above');
  });
});

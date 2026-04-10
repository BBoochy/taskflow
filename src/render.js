function renderTask(task) {
  const checked = task.completed ? ' checked' : '';
  const dateStr = new Date(task.createdAt).toLocaleDateString();
  return `<li class="task-item${task.completed ? ' completed' : ''}" data-id="${task.id}">` +
    `<input type="checkbox"${checked}>` +
    `<span class="task-title">${task.title}</span>` +
    `<span class="task-date">${dateStr}</span>` +
    `<button class="delete" data-action="delete">delete</button></li>`;
}

function renderTaskList(tasks) {
  return `<ul class="task-list">${tasks.map(renderTask).join('')}</ul>`;
}

function renderApp(tasks, filter) {
  const btn = f => {
    const cls = f === filter ? ' active' : '';
    return `<button data-filter="${f}" class="filter-btn${cls}">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`;
  };
  const count = tasks.length;
  return `<div class="app-container">` +
    `<div class="filters">${['all', 'active', 'completed'].map(btn).join('')}</div>` +
    `<span class="task-count">${count} task${count !== 1 ? 's' : ''}</span>` +
    renderTaskList(tasks) + `</div>`;
}

module.exports = { renderTask, renderTaskList, renderApp };

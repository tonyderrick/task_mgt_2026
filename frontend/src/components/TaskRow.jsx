import { CheckIcon, EditIcon, TrashIcon } from './icons.jsx';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const PRIORITY_LABEL = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' };

export default function TaskRow({ task, onToggle, onEdit, onDelete, busy }) {
  const isDone = task.status === 'completed';

  return (
    <article className="task" data-status={task.status}>
      <div className="spine" data-priority={task.priority} aria-hidden="true" />

      <button
        type="button"
        className="toggle"
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-pressed={isDone}
        aria-label={isDone ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
      >
        <CheckIcon />
      </button>

      <div className="task-body">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="meta">
          <span className="priority" data-priority={task.priority}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span>Added {dateFormat.format(new Date(task.createdAt))}</span>
          <span>{isDone ? 'Completed' : 'Pending'}</span>
        </div>
      </div>

      <div className="actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

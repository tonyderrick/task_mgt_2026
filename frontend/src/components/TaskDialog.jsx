import { useEffect, useRef, useState } from 'react';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

const EMPTY = { title: '', description: '', status: 'pending', priority: 'medium' };

/** Mirrors the rules the API enforces, so mistakes are caught before a round trip. */
function validate(values) {
  const errors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Give the task a title.';
  } else if (title.length > TITLE_MAX) {
    errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  }

  if (values.description.length > DESCRIPTION_MAX) {
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  }

  return errors;
}

export default function TaskDialog({ task, onSave, onClose, saving, serverErrors, serverMessage }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    setValues(
      task
        ? {
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
          }
        : EMPTY
    );
    setErrors({});
    setTouched(false);
  }, [task]);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const shownErrors = { ...errors, ...serverErrors };

  const update = (field) => (event) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched(true);
    if (Object.keys(found).length > 0) return;

    onSave({
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
    });
  };

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{task ? 'Edit task' : 'New task'}</h2>

        {serverMessage && <div className="banner">{serverMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              ref={titleRef}
              value={values.title}
              onChange={update('title')}
              onBlur={() => {
                setTouched(true);
                setErrors(validate(values));
              }}
              aria-invalid={Boolean(shownErrors.title)}
              aria-describedby="title-help"
              maxLength={TITLE_MAX + 20}
            />
            {shownErrors.title ? (
              <p className="error" id="title-help">
                {shownErrors.title}
              </p>
            ) : (
              <p className="hint" id="title-help">
                {TITLE_MAX - values.title.trim().length} characters left
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={values.description}
              onChange={update('description')}
              aria-invalid={Boolean(shownErrors.description)}
              placeholder="What needs to happen?"
            />
            {shownErrors.description && <p className="error">{shownErrors.description}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" value={values.priority} onChange={update('priority')}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={values.status} onChange={update('status')}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn-quiet" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

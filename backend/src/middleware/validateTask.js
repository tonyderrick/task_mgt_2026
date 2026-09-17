const STATUSES = ['pending', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

function checkTitle(value, errors) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.title = 'Title is required.';
    return;
  }
  if (value.trim().length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }
}

function checkDescription(value, errors) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'string') {
    errors.description = 'Description must be text.';
    return;
  }
  if (value.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }
}

function checkEnum(field, value, allowed, errors) {
  if (value === undefined) return;
  if (!allowed.includes(value)) {
    errors[field] = `${field} must be one of: ${allowed.join(', ')}.`;
  }
}

/** POST /tasks — title is required, everything else falls back to a default. */
function validateCreate(req, res, next) {
  const errors = {};
  const { title, description, status, priority } = req.body || {};

  checkTitle(title, errors);
  checkDescription(description, errors);
  checkEnum('status', status, STATUSES, errors);
  checkEnum('priority', priority, PRIORITIES, errors);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Some fields need fixing.', errors });
  }

  req.body = {
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : null,
    status: status || 'pending',
    priority: priority || 'medium',
  };
  next();
}

/** PUT /tasks/:id — any subset of fields, but at least one. */
function validateUpdate(req, res, next) {
  const errors = {};
  const { title, description, status, priority } = req.body || {};

  if (title !== undefined) checkTitle(title, errors);
  checkDescription(description, errors);
  checkEnum('status', status, STATUSES, errors);
  checkEnum('priority', priority, PRIORITIES, errors);

  const provided = ['title', 'description', 'status', 'priority'].filter(
    (field) => req.body && req.body[field] !== undefined
  );
  if (provided.length === 0) {
    return res.status(400).json({ message: 'Send at least one field to update.', errors: {} });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Some fields need fixing.', errors });
  }

  const payload = {};
  if (title !== undefined) payload.title = title.trim();
  if (description !== undefined) {
    payload.description = typeof description === 'string' ? description.trim() : null;
  }
  if (status !== undefined) payload.status = status;
  if (priority !== undefined) payload.priority = priority;

  req.body = payload;
  next();
}

/** Rejects /tasks/:id when :id is not a positive integer. */
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Task id must be a positive integer.' });
  }
  req.taskId = id;
  next();
}

module.exports = { validateCreate, validateUpdate, validateId, STATUSES, PRIORITIES };

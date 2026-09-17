const { pool } = require('../db/pool');
const { STATUSES, PRIORITIES } = require('../middleware/validateTask');

/** The database uses snake_case, the API speaks camelCase. */
function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PRIORITY_ORDER = "FIELD(priority, 'high', 'medium', 'low')";

/** GET /api/tasks?status=&priority=&search=&sort= */
async function listTasks(req, res, next) {
  try {
    const { status, priority, search, sort } = req.query;

    const where = [];
    const params = [];

    if (status && STATUSES.includes(status)) {
      where.push('status = ?');
      params.push(status);
    }
    if (priority && PRIORITIES.includes(priority)) {
      where.push('priority = ?');
      params.push(priority);
    }
    if (search && search.trim()) {
      where.push('(title LIKE ? OR description LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const orderBy =
      sort === 'oldest'
        ? 'created_at ASC'
        : sort === 'priority'
        ? `${PRIORITY_ORDER}, created_at DESC`
        : 'created_at DESC';

    const sql = `SELECT * FROM tasks ${
      where.length ? `WHERE ${where.join(' AND ')}` : ''
    } ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);
    res.json({ count: rows.length, data: rows.map(toTask) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/tasks/:id */
async function getTask(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.taskId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ data: toTask(rows[0]) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/tasks */
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)',
      [title, description, status, priority]
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ data: toTask(rows[0]) });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/tasks/:id */
async function updateTask(req, res, next) {
  try {
    const fields = Object.keys(req.body);
    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const params = fields.map((field) => req.body[field]);

    const [result] = await pool.query(
      `UPDATE tasks SET ${assignments} WHERE id = ?`,
      [...params, req.taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.taskId]);
    res.json({ data: toTask(rows[0]) });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/tasks/:id */
async function deleteTask(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.taskId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };

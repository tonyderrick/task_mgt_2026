const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Cannot reach the API. Make sure the backend is running.');
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(body.message || 'The request failed.', {
      status: response.status,
      fieldErrors: body.errors,
    });
  }

  return body;
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchTasks(filters) {
  const body = await request(`/tasks${buildQuery(filters)}`);
  return body.data;
}

export async function fetchTask(id) {
  const body = await request(`/tasks/${id}`);
  return body.data;
}

export async function createTask(payload) {
  const body = await request('/tasks', { method: 'POST', body: JSON.stringify(payload) });
  return body.data;
}

export async function updateTask(id, payload) {
  const body = await request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return body.data;
}

export async function deleteTask(id) {
  await request(`/tasks/${id}`, { method: 'DELETE' });
}

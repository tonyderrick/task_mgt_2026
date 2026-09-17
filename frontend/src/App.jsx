import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from './api/tasks.js';
import FilterRail from './components/FilterRail.jsx';
import TaskRow from './components/TaskRow.jsx';
import TaskDialog from './components/TaskDialog.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

const DEFAULT_FILTERS = { status: 'all', priority: 'all', search: '', sort: 'newest' };

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [allMatching, setAllMatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null); // null | 'new' | task
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Wait for a pause in typing before asking the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const query = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters.status, filters.priority, filters.sort, debouncedSearch]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      // One request honours every filter; the second ignores status so the
      // sidebar can show how many tasks sit in each bucket.
      const [visible, statusAgnostic] = await Promise.all([
        api.fetchTasks(query),
        api.fetchTasks({ ...query, status: 'all' }),
      ]);
      setTasks(visible);
      setAllMatching(statusAgnostic);
    } catch (err) {
      setError(err.message);
      setTasks([]);
      setAllMatching([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      all: allMatching.length,
      pending: allMatching.filter((task) => task.status === 'pending').length,
      completed: allMatching.filter((task) => task.status === 'completed').length,
    }),
    [allMatching]
  );

  async function handleSave(payload) {
    setSaving(true);
    setDialogError(null);
    try {
      if (editing === 'new') {
        await api.createTask(payload);
      } else {
        await api.updateTask(editing.id, payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setDialogError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setBusyId(task.id);

    // Flip it straight away, then reconcile with the server.
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );

    try {
      await api.updateTask(task.id, { status: nextStatus });
      await load();
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.deleteTask(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  const filtersActive =
    filters.status !== 'all' || filters.priority !== 'all' || debouncedSearch.length > 0;

  return (
    <div className="shell">
      <header className="masthead">
        <div>
          <h1>Tasks</h1>
          <p>Everything on your plate, in one list.</p>
        </div>
        <div className="tally">
          <div>
            <strong>{counts.pending}</strong>
            <span>open</span>
          </div>
          <div className="done">
            <strong>{counts.completed}</strong>
            <span>done</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <FilterRail
          filters={filters}
          counts={counts}
          onChange={setFilters}
          onNewTask={() => {
            setDialogError(null);
            setEditing('new');
          }}
        />

        <main>
          {error && <div className="banner">{error}</div>}

          <div className="panel">
            {loading ? (
              <>
                <div className="skeleton-row" />
                <div className="skeleton-row" />
                <div className="skeleton-row" />
              </>
            ) : tasks.length === 0 ? (
              <div className="state">
                {filtersActive ? (
                  <>
                    <h3>No tasks match these filters</h3>
                    <p>Try a different search term, or clear the filters to see everything.</p>
                    <button className="btn btn-quiet" onClick={() => setFilters(DEFAULT_FILTERS)}>
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3>Your list is empty</h3>
                    <p>Add the first thing you need to get done.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setDialogError(null);
                        setEditing('new');
                      }}
                    >
                      New task
                    </button>
                  </>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  busy={busyId === task.id}
                  onToggle={handleToggle}
                  onEdit={(item) => {
                    setDialogError(null);
                    setEditing(item);
                  }}
                  onDelete={setDeleting}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {editing && (
        <TaskDialog
          task={editing === 'new' ? null : editing}
          saving={saving}
          serverErrors={dialogError?.fieldErrors}
          serverMessage={
            dialogError && Object.keys(dialogError.fieldErrors || {}).length === 0
              ? dialogError.message
              : null
          }
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          task={deleting}
          busy={saving}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

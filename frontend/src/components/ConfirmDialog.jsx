import { useEffect } from 'react';

export default function ConfirmDialog({ task, onConfirm, onClose, busy }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Delete this task?</h2>
        <p style={{ marginTop: 0, color: 'var(--muted)' }}>
          “{task.title}” will be removed from the database. This cannot be undone.
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-quiet" onClick={onClose} autoFocus>
            Keep task
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete task'}
          </button>
        </div>
      </div>
    </div>
  );
}

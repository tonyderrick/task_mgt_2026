const STATUS_TABS = [
  { value: 'all', label: 'All tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function FilterRail({ filters, counts, onChange, onNewTask }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="rail">
      <button className="btn btn-primary btn-block" onClick={onNewTask}>
        New task
      </button>

      <div className="rail-group">
        <h2 id="search-label">Search</h2>
        <div className="search">
          <input
            type="search"
            aria-labelledby="search-label"
            placeholder="Title or description"
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
          />
          {filters.search && (
            <button type="button" onClick={() => set({ search: '' })} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="rail-group">
        <h2 id="status-label">Status</h2>
        <div className="segmented" role="group" aria-labelledby="status-label">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filters.status === tab.value}
              onClick={() => set({ status: tab.value })}
            >
              <span>{tab.label}</span>
              <span className="count">{counts[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rail-group">
        <h2 id="priority-label">Priority</h2>
        <select
          aria-labelledby="priority-label"
          value={filters.priority}
          onChange={(event) => set({ priority: event.target.value })}
        >
          <option value="all">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="rail-group">
        <h2 id="sort-label">Sort</h2>
        <select
          aria-labelledby="sort-label"
          value={filters.sort}
          onChange={(event) => set({ sort: event.target.value })}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority</option>
        </select>
      </div>
    </aside>
  );
}

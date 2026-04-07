export default function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;
  const indicator = isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕';

  return (
    <th>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        <span>{label}</span>
        <span aria-hidden="true" style={{ opacity: isActive ? 1 : 0.55 }}>
          {indicator}
        </span>
      </button>
    </th>
  );
}

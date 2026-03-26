import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function AddDataMenu({ label = 'Tambah Data', actions = [], disabled = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleActions = actions.filter(Boolean);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        type="button"
        className="btn btn-primary action-menu-toggle"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <Plus size={18} />
        {label}
        <ChevronDown size={16} className={`chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="action-menu-dropdown">
          {visibleActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`dropdown-item ${action.danger ? 'dropdown-item-danger' : ''}`}
              onClick={() => {
                setOpen(false);
                action.onClick?.();
              }}
              disabled={action.disabled}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

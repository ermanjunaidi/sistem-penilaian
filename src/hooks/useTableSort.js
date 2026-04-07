import { useMemo, useState } from 'react';

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';

    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && trimmed === String(asNumber)) {
      return asNumber;
    }

    const asDate = Date.parse(trimmed);
    if (!Number.isNaN(asDate) && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return asDate;
    }

    return trimmed.toLowerCase();
  }

  if (typeof value === 'boolean') return value ? 1 : 0;
  return String(value).toLowerCase();
}

export default function useTableSort(data = [], accessors = {}, initialSort = {}) {
  const [sortConfig, setSortConfig] = useState({
    key: initialSort.key ?? null,
    direction: initialSort.direction ?? 'asc',
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !accessors[sortConfig.key]) {
      return data;
    }

    const accessor = accessors[sortConfig.key];
    const sorted = [...data].sort((left, right) => {
      const leftValue = normalizeValue(accessor(left));
      const rightValue = normalizeValue(accessor(right));

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return leftValue - rightValue;
      }

      return String(leftValue).localeCompare(String(rightValue), 'id', {
        numeric: true,
        sensitivity: 'base',
      });
    });

    return sortConfig.direction === 'desc' ? sorted.reverse() : sorted;
  }, [accessors, data, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
  };
}

import { useEffect, useMemo, useState } from 'react';

export default function useBulkSelection(items = [], getId = (item) => item?.id) {
  const [selectedIds, setSelectedIds] = useState([]);

  const itemIds = useMemo(
    () => items.map((item) => getId(item)).filter(Boolean),
    [getId, items]
  );

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => itemIds.includes(id)));
  }, [itemIds]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isSelected = (id) => selectedIdSet.has(id);

  const toggleItem = (id) => {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    ));
  };

  const isAllSelected = (targetItems = items) => {
    const targetIds = targetItems.map((item) => getId(item)).filter(Boolean);
    return targetIds.length > 0 && targetIds.every((id) => selectedIdSet.has(id));
  };

  const toggleAll = (targetItems = items) => {
    const targetIds = targetItems.map((item) => getId(item)).filter(Boolean);
    if (targetIds.length === 0) return;

    setSelectedIds((prev) => {
      const allSelected = targetIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !targetIds.includes(id));
      }

      return [...new Set([...prev, ...targetIds])];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    isSelected,
    isAllSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  };
}

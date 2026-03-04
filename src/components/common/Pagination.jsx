export default function Pagination({
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Menampilkan {start}-{end} dari {totalItems} data
      </div>

      <div className="pagination-controls">
        <label className="pagination-size">
          Baris:
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>

        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Sebelumnya
        </button>

        <span className="pagination-page">
          Halaman {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

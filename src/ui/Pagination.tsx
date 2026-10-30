import { useEffect, useState } from 'react';
const PAGE_SIZE = 10;
export function usePagination<T>(items: T[], resetKey = '') {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [resetKey]);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  return {
    items: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    page: current,
    pages,
    setPage,
  };
}
export function Pagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginação">
      <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages}
      </span>
      <button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>
        Próxima
      </button>
    </nav>
  );
}

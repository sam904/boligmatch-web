// src/components/common/Pagination.tsx
import React from 'react';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
};

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center gap-2">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="px-2 py-1 border rounded">Prev</button>
      <span className="text-sm">Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-2 py-1 border rounded">Next</button>
    </div>
  );
}

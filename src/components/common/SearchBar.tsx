// src/components/common/SearchBar.tsx
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  pageSize,
  onPageSizeChange,
}: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('common.search') || "Search..."}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200"
          />
        </div>
      </div>

      {onPageSizeChange && pageSize && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">{t('common.itemsPerPage')}:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    </div>
  );
}
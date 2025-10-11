// src/components/common/DataTable/DataTable.tsx
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export default function DataTable<T>({ data, columns }: Props<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id} className="border-b border-gray-200">
            {hg.headers.map(h => (
              <th key={h.id} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {table.getRowModel().rows.map(row => (
          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

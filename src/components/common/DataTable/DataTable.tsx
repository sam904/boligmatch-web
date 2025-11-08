// src/components/common/DataTable/DataTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { IconSortDown } from "../Icons/Index";

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export default function DataTable<T>({ data, columns }: Props<T>) {
  // Set initial sorting to desc on the first column (usually 'id')
  const [sorting, setSorting] = useState<SortingState>([
    { id: columns[0]?.id || "id", desc: true }, // Start with desc direction
  ]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Single rotating arrow using IconSortDown
  const SortArrow = ({ isSorted }: { isSorted: false | "asc" | "desc" }) => {
    return (
      <IconSortDown
        className={`w-3 h-3 transition-transform duration-200 ${
          isSorted === "asc" ? "rotate-180" : ""
        } ${
          isSorted ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"
        }`}
      />
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-[#EAECF0]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h, index) => (
                  <th
                    key={h.id}
                    className={`px-6 py-3 text-left text-xs font-semibold text-[#8A92A6] uppercase tracking-wider ${
                      // Make the last column (actions) sticky
                      index === hg.headers.length - 1 
                        ? 'sticky right-0 bg-[#EAECF0] z-10 shadow-left'
                        : ''
                    }`}
                    style={{
                      // Add shadow for the sticky column
                      boxShadow: index === hg.headers.length - 1 
                        ? '-2px 0 4px rgba(0,0,0,0.1)' 
                        : 'none'
                    }}
                  >
                    {h.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors focus:outline-none group w-full text-left"
                      >
                        <span className="flex-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </span>
                        <SortArrow isSorted={h.column.getIsSorted()} />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[#91C73D]/5">
                {row.getVisibleCells().map((cell, index) => (
                  <td 
                    key={cell.id} 
                    className={`px-6 py-4 text-sm text-gray-900 ${
                      // Make the last column (actions) sticky
                      index === row.getVisibleCells().length - 1 
                        ? 'sticky right-0 bg-white z-10 shadow-left'
                        : ''
                    }`}
                    style={{
                      // Add shadow for the sticky column
                      boxShadow: index === row.getVisibleCells().length - 1 
                        ? '-2px 0 4px rgba(0,0,0,0.1)' 
                        : 'none'
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
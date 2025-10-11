// src/features/admin/users/UsersListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/user.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../../../types/user';

export default function UsersListPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(true),
  });

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'userId', header: 'ID' },
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobileNo', header: 'Mobile' },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {row.original.roleName}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ 
            backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
          }}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 text-sm mt-1">View all users</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <DataTable data={users} columns={columns} />
        </div>
      )}
    </div>
  );
}

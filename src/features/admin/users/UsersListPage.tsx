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
        <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
          {row.original.roleName}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-sm ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {isLoading ? <div>Loading...</div> : <DataTable data={users} columns={columns} />}
    </div>
  );
}

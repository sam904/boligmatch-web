// src/features/users/UsersPage.tsx
import { useQuery } from '@tanstack/react-query';
import { usersService } from './users.service';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setPage, setPageSize, setSearch, setRole } from './usersSlice';
import DataTable from '../../components/common/DataTable/DataTable';
import Pagination from '../../components/common/Pagination';
import Input from '../../components/common/Input';

export default function UsersPage() {
  const ui = useAppSelector(s => s.users);
  const dispatch = useAppDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['users', ui],
    queryFn: () => usersService.list(ui),
    placeholderData: () => data,
  });

  const columns = [
    { header: 'Email', accessorKey: 'email' },
    { header: 'Roles', cell: ({ row }: any) => row.original.roles.join(', ') },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Search" value={ui.search} onChange={e => dispatch(setSearch(e.target.value))} />
        <Input label="Role" value={ui.role ?? ''} onChange={e => dispatch(setRole(e.target.value || null))} />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable data={data?.items ?? []} columns={columns as any} />
          <Pagination
            page={ui.page}
            pageSize={ui.pageSize}
            total={data?.total ?? 0}
            onPageChange={p => dispatch(setPage(p))}
          />
        </>
      )}
    </div>
  );
}

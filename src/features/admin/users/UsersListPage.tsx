// src/features/admin/users/UsersListPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/user.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Pagination from '../../../components/common/Pagination';
import SearchBar from '../../../components/common/SearchBar';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../../../types/user';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobileNo: z.string().min(1, 'Mobile number is required'),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersListPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const { data: paginatedResponse, isLoading } = useQuery({
    queryKey: ['users', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => userService.getPaginated({
      page: currentPage,
      pageSize,
      searchTerm: debouncedSearchTerm || undefined,
    }),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        email: editingUser.email || '',
        mobileNo: editingUser.mobileNo || '',
        isActive: editingUser.isActive,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        mobileNo: '',
        isActive: true,
      });
    }
  }, [editingUser, reset]);

  const createMutation = useMutation({
    mutationFn: userService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
      toast.success(t('admin.users.createSuccess') || 'User created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error(t('admin.users.createError') || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: userService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
      toast.success(t('admin.users.updateSuccess') || 'User updated successfully');
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    },
    onError: () => toast.error(t('admin.users.updateError') || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: userService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
      toast.success(t('admin.users.deleteSuccess') || 'User deleted successfully');
    },
    onError: () => toast.error(t('admin.users.deleteError') || 'Failed to delete user'),
  });

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateMutation.mutate({ ...data, id: editingUser.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Correctly map the API response
 const users = paginatedResponse?.output?.result || [];
 const totalItems = paginatedResponse?.output?.rowCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const columns: ColumnDef<User>[] = [
    { 
      accessorKey: 'id', 
      header: 'ID',
      cell: ({ row }) => row.original.id || '-'
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || '-',
    },
    { 
      accessorKey: 'email', 
      header: 'Email',
      cell: ({ row }) => row.original.email || '-'
    },
    { 
      accessorKey: 'mobileNo', 
      header: 'Mobile',
      cell: ({ row }) => row.original.mobileNo || '-'
    },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => row.original.roleName || 'User'
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setEditingUser(row.original);
            setIsModalOpen(true);
          }}>Edit</Button>
          <Button variant="danger" onClick={() => {
            if (window.confirm('Are you sure you want to delete this user?')) {
              deleteMutation.mutate(row.original.id);
            }
          }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      {/* <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 text-sm mt-1">View all users</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
      <div className="flex justify-between items-center">
  {/* Left side: Title */}
  <div>
    <h1 className="text-xl font-bold text-gray-900">Users</h1>
    <p className="text-gray-600 text-sm mt-1">View all users</p>
  </div>
  
  {/* Right side: SearchBar and Add User button */}
  <div className="flex items-center gap-4">
    <div className="w-64"> {/* Fixed width for SearchBar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
    </div>
    <button
      onClick={() => {
        setEditingUser(null);
        setIsModalOpen(true);
      }}
      className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient whitespace-nowrap"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add User
    </button>
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
          {/* <div className="p-4 border-b border-gray-200">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              //pageSize={pageSize}
              //{handlePageSizeChange}
            />
          </div> */}
          <DataTable data={users} columns={columns} />
          <div className="px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingUser ? 'Edit User' : 'Add User'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="First Name" 
            error={errors.firstName?.message} 
            {...register('firstName')} 
          />
          <Input 
            label="Last Name" 
            error={errors.lastName?.message} 
            {...register('lastName')} 
          />
          <Input 
            label="Email" 
            type="email"
            error={errors.email?.message} 
            {...register('email')} 
          />
          <Input 
            label="Mobile Number" 
            error={errors.mobileNo?.message} 
            {...register('mobileNo')} 
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">Active</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
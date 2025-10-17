// src/features/admin/users/UsersListPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../../services/user.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../hooks/useDebounce";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "../../../types/user";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(1, "Mobile number is required"),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersListPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Fetch all users without filtering
  const { data: paginatedResponse, isLoading } = useQuery({
    queryKey: ["users", currentPage, pageSize, debouncedSearchTerm],
    queryFn: () =>
      userService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setError,
    clearErrors
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        mobileNo: editingUser.mobileNo || "",
        isActive: editingUser.isActive,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        isActive: true,
      });
    }
  }, [editingUser, reset]);

  const createMutation = useMutation({
    mutationFn: userService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.createSuccess") || "User created successfully"
      );
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t("admin.users.createError") || "Failed to create user");
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof UserFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: userService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.updateSuccess") || "User updated successfully"
      );
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t("admin.users.updateError") || "Failed to update user");
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof UserFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.deleteSuccess") || "User deleted successfully"
      );
    },
    onError: () =>
      toast.error(t("admin.users.deleteError") || "Failed to delete user"),
  });

  const onSubmit = async (data: UserFormData) => {
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

  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleDeleteUser = (user: User) => {
    if (!user.id) return;
    
    const confirmMessage = t('admin.users.deleteConfirm') || "Are you sure you want to delete this user?";
    
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    clearErrors();
  };

  // Get all users from API response
  const allUsers = paginatedResponse?.output?.result || [];

  // Apply client-side filtering based on status filter
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.isActive === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => user.isActive === false);
    }
    // If statusFilter is 'all', no filtering needed

    return filtered;
  }, [allUsers, statusFilter]);

  // For pagination, we need to handle the filtered data
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, pageSize]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: t('admin.users.id') || "ID",
      cell: ({ row }) => row.original.id || "-",
    },
    {
      accessorKey: "fullName",
      header: t('admin.users.name') || "Name",
      cell: ({ row }) =>
        `${row.original.firstName || ""} ${
          row.original.lastName || ""
        }`.trim() || "-",
    },
    {
      accessorKey: "email",
      header: t('admin.users.email') || "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "mobileNo",
      header: t('admin.users.mobile') || "Mobile",
      cell: ({ row }) => row.original.mobileNo || "-",
    },
    {
      accessorKey: "roleName",
      header: t('admin.users.role') || "Role",
      cell: ({ row }) => row.original.roleName || "User",
    },
    {
      accessorKey: "isActive",
      header: t('common.status') || "Status",
      cell: ({ row }) => (
        <span
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{
            backgroundColor: row.original.isActive
              ? "var(--color-secondary)"
              : "var(--color-neutral)",
          }}
        >
          {row.original.isActive ? t('common.active') || "Active" : t('common.inactive') || "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: t('common.actions') || "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title={t('common.edit') || "Edit user"}
            onClick={() => {
              setEditingUser(row.original);
              setIsModalOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrash}
            title={t('common.delete') || "Delete user"}
            onClick={() => handleDeleteUser(row.original)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
        <div className="flex justify-between items-center">
          {/* Left side: Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('admin.users.title') || "Users"}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.users.subtitle') || "View all users"}</p>
          </div>

          {/* Right side: Filters, SearchBar and Add User button */}
          <div className="flex items-center gap-4">
            {/* Status Filter Dropdown */}
            <div className="w-32">
              <select 
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="active">{t('common.active') || "Active"}</option>
                <option value="inactive">{t('common.inactive') || "Inactive"}</option>
                <option value="all">{t('common.all') || "All"}</option>
              </select>
            </div>

            <div className="w-64">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </div>
            {/* <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
            >
              {t('admin.users.addUser') || "Add User"}
            </Button> */}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-3 text-sm text-gray-600">{t('common.loading') || "Loading..."}</p>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable data={currentPageItems} columns={columns} />
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

      {/* User Form Modal */}
      <Modal
        open={isModalOpen}
        title={editingUser ? t('admin.users.editUser') || "Edit User" : t('admin.users.addUser') || "Add User"}
        onClose={handleModalClose}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('admin.users.firstName') || "First Name"}
            error={errors.firstName?.message}
            {...register("firstName")}
            required
            placeholder="Enter first name"
          />
          <Input
            label={t('admin.users.lastName') || "Last Name"}
            error={errors.lastName?.message}
            {...register("lastName")}
            required
            placeholder="Enter last name"
          />
          <Input
            label={t('admin.users.email') || "Email"}
            type="email"
            error={errors.email?.message}
            {...register("email")}
            required
            placeholder="Enter email address"
          />
          <Input
            label={t('admin.users.mobileNo') || "Mobile Number"}
            error={errors.mobileNo?.message}
            {...register("mobileNo")}
            required
            placeholder="Enter mobile number"
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive" 
              {...register('isActive')} 
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              {t('common.active') || "Active"}
            </label>
          </div>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Please fix the following errors:
              </div>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.firstName && <li>{errors.firstName.message}</li>}
                {errors.lastName && <li>{errors.lastName.message}</li>}
                {errors.email && <li>{errors.email.message}</li>}
                {errors.mobileNo && <li>{errors.mobileNo.message}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleModalClose}
            >
              {t('common.cancel') || "Cancel"}
            </Button>
            <Button 
              type="submit"
              disabled={!isValid || createMutation.isPending || updateMutation.isPending}
            >
              {editingUser ? t('common.update') || "Update" : t('common.create') || "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
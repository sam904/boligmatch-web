// src/features/admin/users/UsersListPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../../services/user.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import AdminToast from "../../../components/common/AdminToast";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form"; // Type-only import
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconUpload,
  IconKey,
  IconNoRecords,
} from "../../../components/common/Icons/Index";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "../../../types/user";
import { exportToExcel } from "../../../utils/export.utils";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

// Fixed schema with proper required status
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (value) => {
        if (!value) return false;
        // Allow exactly 8 digits
        return /^\d{8}$/.test(value);
      },
      {
        message: "Mobile number must be exactly 8 digits",
      }
    ),
  isActive: z.boolean(),
  status: z.enum(["All", "Active", "InActive"]),
});

// Password reset schema
const passwordResetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userSchema>;
type PasswordResetData = z.infer<typeof passwordResetSchema>;

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

export default function UsersListPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "InActive"
  >("All");
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Toast management functions
  const showToast = (
    type: AdminToastType,
    message: string,
    title?: string,
    subtitle?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastState = {
      id,
      type,
      message,
      title,
      subtitle,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const toast = {
    success: (message: string, title?: string, subtitle?: string) =>
      showToast("success", message, title, subtitle),
    error: (message: string, title?: string, subtitle?: string) =>
      showToast("error", message, title, subtitle),
    info: (message: string, title?: string, subtitle?: string) =>
      showToast("info", message, title, subtitle),
  };

  // Helper function to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
      const apiError = error as any;
      return (
        apiError?.message || apiError?.response?.data?.message || defaultMessage
      );
    }
    return defaultMessage;
  };

  // Fetch users with error handling
  const {
    data: paginatedData,
    isLoading,
    error: fetchError,
    isError: isFetchError,
  } = useQuery({
    queryKey: [
      "users",
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      userService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter,
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Show fetch error toast
  useEffect(() => {
    if (isFetchError && fetchError) {
      const errorMessage = getErrorMessage(fetchError, "Failed to load users");
      toast.error(errorMessage);
    }
  }, [isFetchError, fetchError]);

  // Fixed useForm with proper typing
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      isActive: true,
      status: "Active",
    },
  });

  const isActiveValue = watch("isActive");

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
    reset: resetPassword,
    watch: watchPasswordForm,
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watchPasswordForm("newPassword");

  useEffect(() => {
    if (editingUser) {
      reset({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        mobileNo: editingUser.mobileNo || "",
        isActive: editingUser.isActive,
        status: editingUser.status || "Active",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        isActive: true,
        status: "Active",
      });
    }
  }, [editingUser, reset]);

  // Password reset mutation with error handling
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { user: User; newPassword: string }) => {
      try {
        const response = await userService.resetUserPassword({
          email: data.user.email,
          newPassword: data.newPassword,
        });

        if (response === true) {
          return response;
        } else {
          throw new Error("Password reset failed - server returned false");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Password reset failed");
        throw new Error(errorMessage);
      }
    },
    onSuccess: (response, variables) => {
      console.log("Password reset response:", response);
      toast.success(`Password reset successfully for ${variables.user.email}`);
      setIsPasswordModalOpen(false);
      resetPassword();
      setResettingUser(null);
    },
    onError: (error: Error, variables) => {
      console.error("Reset password error:", error);
      toast.error(
        `Failed to reset password for ${variables.user.email}: ${error.message}`
      );
    },
  });

  // Create user mutation with error handling
  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      try {
        return await userService.add(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to create user");
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.createSuccess") || "User created successfully"
      );
      setIsModalOpen(false);
      reset();
      setEditingUser(null);
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, "Failed to create user");
      toast.error(errorMessage);

      // Handle backend validation errors
      if (
        error.message.includes("validation") ||
        error.message.includes("error")
      ) {
        const apiError = error as any;
        if (apiError?.response?.data?.errors) {
          const backendErrors = apiError.response.data.errors;
          Object.keys(backendErrors).forEach((key) => {
            setError(key as keyof UserFormData, {
              type: "server",
              message: Array.isArray(backendErrors[key])
                ? backendErrors[key][0]
                : backendErrors[key],
            });
          });
        }
      }
    },
  });

  // Update user mutation with error handling
  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData & { id: number }) => {
      try {
        return await userService.update(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to update user");
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.updateSuccess") || "User updated successfully"
      );
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, "Failed to update user");
      toast.error(errorMessage);

      // Handle backend validation errors
      if (
        error.message.includes("validation") ||
        error.message.includes("error")
      ) {
        const apiError = error as any;
        if (apiError?.response?.data?.errors) {
          const backendErrors = apiError.response.data.errors;
          Object.keys(backendErrors).forEach((key) => {
            setError(key as keyof UserFormData, {
              type: "server",
              message: Array.isArray(backendErrors[key])
                ? backendErrors[key][0]
                : backendErrors[key],
            });
          });
        }
      }
    },
  });

  // Delete user mutation with error handling
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await userService.remove(id);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to delete user");
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      toast.success(
        t("admin.users.deleteSuccess") || "User deleted successfully"
      );
      setDeleteConfirmation({ isOpen: false, user: null });
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, "Failed to delete user");
      toast.error(errorMessage);
      setDeleteConfirmation({ isOpen: false, user: null });
    },
  });

  // Fixed onSubmit with proper typing
  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({ ...data, id: editingUser.id });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in the mutation onError
      console.error("Form submission error:", error);
    }
  };

  const onSubmitPasswordReset = async (data: PasswordResetData) => {
    if (!resettingUser) {
      toast.error("No user selected for password reset");
      return;
    }

    resetPasswordMutation.mutate({
      user: resettingUser,
      newPassword: data.newPassword,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: "All" | "Active" | "InActive") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleDeleteUser = (user: User) => {
    if (!user.id) {
      toast.error("Cannot delete user: Invalid user ID");
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      user: user,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.user?.id) {
      deleteMutation.mutate(deleteConfirmation.user.id);
    } else {
      toast.error("Cannot delete user: Invalid user ID");
      setDeleteConfirmation({ isOpen: false, user: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, user: null });
  };

  const handleResetPassword = (user: User) => {
    if (!user.email) {
      toast.error("Cannot reset password: User email is missing");
      return;
    }
    setResettingUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
    clearErrors();
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setResettingUser(null);
    resetPassword();
  };

  const handleExportUsers = async () => {
    try {
      setIsExporting(true);

      const exportParams: Record<string, any> = {
        includeIsActive: true,
      };

      if (debouncedSearchTerm) {
        exportParams.searchTerm = debouncedSearchTerm;
      }

      // Update export to handle "All" status
      if (statusFilter !== "All") {
        exportParams.status = statusFilter === "Active" ? "Active" : "InActive";
      } else {
        exportParams.status = "All";
      }

      console.log("Exporting users with params:", exportParams);
      await exportToExcel("User", exportParams);

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = getErrorMessage(error, "Failed to export users");
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Safe data extraction with fallbacks
  const users = paginatedData?.output?.result || [];
  const totalItems = paginatedData?.output?.rowCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Check if there are any records to display
  const hasRecords = users.length > 0;

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: t("admin.users.id") || "ID",
      cell: ({ row }) => row.original.id?.toString() || "-",
    },
    {
      accessorKey: "fullName",
      header: t("admin.users.name") || "Name",
      cell: ({ row }) =>
        `${row.original.firstName || ""} ${
          row.original.lastName || ""
        }`.trim() || "-",
    },
    {
      accessorKey: "email",
      header: t("admin.users.email") || "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "mobileNo",
      header: t("admin.users.mobileNo") || "Mobile",
      cell: ({ row }) => row.original.mobileNo || "-",
    },
    {
      accessorKey: "roleName",
      header: t("admin.users.role") || "Role",
      cell: ({ row }) => row.original.roleName || "User",
    },
    {
      accessorKey: "status",
      header: t("common.status") || "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="px-2 py-1 rounded-full text-xs text-white font-medium"
          style={{
            backgroundColor:
              row.original.status === "Active"
                ? "var(--color-secondary)"
                : "var(--color-neutral)",
          }}
        >
            {row.original.isActive
            ? t("common.active") || "Active"
            : t("common.inactive") || "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("common.actions") || "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingUser(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.edit") || "Edit user"}
            disabled={updateMutation.isPending}
          >
            <IconPencil />
          </button>
          <button
            type="button"
            onClick={() => handleResetPassword(row.original)}
            disabled={resetPasswordMutation.isPending}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title={t("admin.users.resetPassword") || "Reset Password"}
          >
            <IconKey />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteUser(row.original)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.delete") || "Delete user"}
            disabled={deleteMutation.isPending}
          >
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      {/* Render Toast Banners */}
      {toasts.map((toastItem) => (
        <AdminToast
          key={toastItem.id}
          type={toastItem.type}
          message={toastItem.message}
          onClose={() => hideToast(toastItem.id)}
          autoDismissMs={5000}
        />
      ))}

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={
          deleteConfirmation.user
            ? `User: ${deleteConfirmation.user.firstName} ${deleteConfirmation.user.lastName} (${deleteConfirmation.user.email})`
            : undefined
        }
        confirmationMessage={
          t("admin.users.deleteConfirm") ||
          "Are you sure you want to delete this user?"
        }
        isLoading={deleteMutation.isPending}
      />

      {/* Header Section */}
      <div className="p-2 mb-2">
        <div className="flex justify-between items-center">
          <div className="font-figtree">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              icon={IconPlus}
              iconPosition="left"
              iconSize="w-5 h-5"
              disabled={createMutation.isPending}
            >
              {t("admin.users.addUser") || "Add User"}
            </Button>
          </div>

          {/* Right side: Filters, SearchBar and Export button */}
          <div className="flex items-center gap-3">
            <FilterDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />

            <div className="w-64">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleExportUsers}
              disabled={isExporting || !hasRecords}
              icon={IconUpload}
              iconPosition="left"
              iconSize="w-5 h-5"
            >
              {isExporting
                ? t("common.exporting") || "Exporting..."
                : t("common.ExportCSV") || "Export CSV"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isFetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">Failed to load users</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {getErrorMessage(fetchError, "Please try again later")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.refetchQueries({ queryKey: ["users"] })}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: "var(--color-primary)" }}
          ></div>
          <p className="mt-3 text-sm text-gray-600">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      ) : (
        /* Data Table or No Records Message */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {hasRecords ? (
            <>
              <DataTable data={users} columns={columns} />
              {/* Only show pagination if there are records and more than one page */}
              {hasRecords && totalPages > 1 && (
                <div className="px-4 pb-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            /* No Records Found Message */
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <IconNoRecords className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("common.noRecordsFound") || "No records found"}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "No users have been created yet"}
                </p>
                {!searchTerm && statusFilter === "All" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setEditingUser(null);
                      setIsModalOpen(true);
                    }}
                    icon={IconPlus}
                    iconPosition="left"
                    iconSize="w-5 h-5"
                  >
                    {t("admin.users.addUser") || "Add Your First User"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Form Modal */}
      <Modal
        open={isModalOpen}
        title={
          editingUser
            ? t("admin.users.editUser") || "Edit User"
            : t("admin.users.addUser") || "Add User"
        }
        onClose={handleModalClose}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={<>{t("admin.users.firstName") || "First Name"}
            <span className="text-red-500 ml-1">*</span>
            </>}
            error={errors.firstName?.message}
            {...register("firstName")}
            required
            placeholder={t("admin.users.EnterfirstName")||"Enter first name"}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          <Input
            label={<>{t("admin.users.lastName") || "Last Name"}
             <span className="text-red-500 ml-1">*</span>
            </>}
            error={errors.lastName?.message}
            {...register("lastName")}
            required
            placeholder={t("admin.users.EnterlastName")||"Enter last name"}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          <Input
            label={<>{t("admin.users.email") || "Email"}
             <span className="text-red-500 ml-1">*</span>
            </>}
            type="email"
            error={errors.email?.message}
            {...register("email")}
            required
            placeholder={t("admin.users.Enteremailaddress")||"Enter email address"}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              !!editingUser
            }
          />
          <Input
            label={<>{t("admin.users.mobileNo") || "Mobile Number"}
            <span className="text-red-500 ml-1">*</span>
            </>}
            error={errors.mobileNo?.message}
            {...register("mobileNo")}
            required
            placeholder={t("admin.users.EntermobileNo") || "Mobile Number"}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          {/* Status Dropdown */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register("status")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <option value="Active">Active</option>
              <option value="InActive">InActive</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div> */}

          {/* Toggle Switch for Active Status */}
          <ToggleSwitch
            label={t("common.active") || "Active"}
            checked={isActiveValue}
            onChange={(checked) => setValue("isActive", checked)}
          />

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Please fix the following errors:
              </div>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.firstName && <li>{errors.firstName.message}</li>}
                {errors.lastName && <li>{errors.lastName.message}</li>}
                {errors.email && <li>{errors.email.message}</li>}
                {errors.mobileNo && <li>{errors.mobileNo.message}</li>}
                {errors.status && <li>{errors.status.message}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              className="flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              disabled={
                !isValid || createMutation.isPending || updateMutation.isPending
              }
              className="flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t("common.Submitting") ||  "Submitting..."
                : editingUser
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        open={isPasswordModalOpen}
        title={t("admin.users.resetPassword") || "Reset Password"}
        onClose={handlePasswordModalClose}
      >
        {resettingUser && (
          <form
            onSubmit={handleSubmitPassword(onSubmitPasswordReset)}
            className="space-y-4"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Resetting password for: <strong>{resettingUser.email}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {resettingUser.firstName} {resettingUser.lastName}
              </p>
            </div>

            <Input
              label="New Password"
              type="password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword("newPassword")}
              required
              placeholder="Enter new password"
              disabled={resetPasswordMutation.isPending}
            />

            <Input
              label="Confirm Password"
              type="password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword("confirmPassword")}
              required
              placeholder="Confirm new password"
              disabled={resetPasswordMutation.isPending}
            />

            {watchPassword && (
              <div
                className={`text-xs p-2 rounded ${
                  watchPassword.length >= 6
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                Password strength:{" "}
                {watchPassword.length >= 6 ? "Strong" : "Weak"}
                (min. 6 characters)
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePasswordModalClose}
                disabled={resetPasswordMutation.isPending}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={!isPasswordValid || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

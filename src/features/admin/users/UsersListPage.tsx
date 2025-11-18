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
import type { SubmitHandler } from "react-hook-form";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ResetPasswordModal from "../../../components/common/ResetPasswordModal";
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

  // Create schema inside component to access translation function
  const userSchema = z.object({
    firstName: z.string().min(1, t("validation.nameRequired") || "First name is required"),
    lastName: z.string().min(1, t("validation.nameRequired") || "Last name is required"),
    email: z.string().email(t("validation.emailInvalid") || "Invalid email address"),
    mobileNo: z
      .string()
      .min(1, t("validation.mobileRequired") || "Mobile number is required")
      .refine(
        (value) => {
          if (!value) return false;
          // Allow exactly 8 digits
          return /^\d{8}$/.test(value);
        },
        {
          message: t("validation.mobileInvalidLength") || "Mobile number must be exactly 8 digits",
        }
      ),
    isActive: z.boolean(),
    status: z.enum(["All", "Active", "InActive"]),
  });

  type UserFormData = z.infer<typeof userSchema>;

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
  // Email and Mobile Validation States
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const [mobileValidation, setMobileValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const [emailDebounceTimer, setEmailDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mobileDebounceTimer, setMobileDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

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
        sortDirection: "desc",
        sortField: "id",
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Show fetch error toast
  useEffect(() => {
    if (isFetchError && fetchError) {
      const errorMessage = getErrorMessage(fetchError, t("admin.users.createError") || "Failed to load users");
      toast.error(errorMessage);
    }
  }, [isFetchError, fetchError, t]);

  // Fixed useForm with proper typing
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
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

      // Reset validation states for editing mode
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
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

      // Reset validation states for new user
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
      });
    }
  }, [editingUser, reset]);

  // Create user mutation with error handling
  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      try {
        return await userService.add(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error, t("admin.users.createError") || "Failed to create user");
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
      const errorMessage = getErrorMessage(error, t("admin.users.createError") || "Failed to create user");
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
        const errorMessage = getErrorMessage(error, t("admin.users.updateError") || "Failed to update user");
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
      const errorMessage = getErrorMessage(error, t("admin.users.updateError") || "Failed to update user");
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
        const errorMessage = getErrorMessage(error, t("admin.users.deleteError") || "Failed to delete user");
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
      const errorMessage = getErrorMessage(error, t("admin.users.deleteError") || "Failed to delete user");
      toast.error(errorMessage);
      setDeleteConfirmation({ isOpen: false, user: null });
    },
  });

  // Enhanced email validation function
  const validateEmailAvailability = async (email: string) => {
    if (!email) {
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        checking: false,
        available: false,
        message: t("validation.emailInvalid") || "Please enter a valid email address",
      });
      return;
    }

    // If editing and email hasn't changed, mark as available without API call
    if (editingUser && email === editingUser.email) {
      setEmailValidation({
        checking: false,
        available: true,
        message: t("validation.emailUnchanged") || "Email unchanged",
      });
      return;
    }

    // If we already validated this email and it's available, don't call API again
    if (
      emailValidation.available === true &&
      emailValidation.message.includes("available")
    ) {
      return;
    }

    setEmailValidation({
      checking: true,
      available: null,
      message: t("validation.emailChecking") || "Checking email availability...",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(email);

      if (response.isSuccess) {
        setEmailValidation({
          checking: false,
          available: true,
          message: t("validation.emailAvailable") || "Email is available",
        });
      } else {
        setEmailValidation({
          checking: false,
          available: false,
          message: response.failureReason || t("validation.emailAlreadyRegistered") || "Email already registered",
        });
      }
    } catch (error: any) {
      console.error("Email validation error:", error);

      if (error.response?.status === 400) {
        setEmailValidation({
          checking: false,
          available: false,
          message:
            error.response.data?.failureReason || t("validation.emailAlreadyRegistered") || "Email already registered",
        });
      } else {
        setEmailValidation({
          checking: false,
          available: null,
          message: t("validation.emailCheckError") || "Error checking email availability",
        });
      }
    }
  };

  // Enhanced mobile validation function
  const validateMobileAvailability = async (mobileNo: string) => {
    if (!mobileNo) {
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Clean mobile number (remove spaces, dashes, etc.)
    const cleanMobile = mobileNo.replace(/[\s\-\(\)]+/g, "");

    // UPDATED: Basic mobile validation - exactly 8 digits
    if (cleanMobile.length !== 8) {
      setMobileValidation({
        checking: false,
        available: false,
        message: t("validation.mobileInvalidLength") || "Mobile number must be exactly 8 digits",
      });
      return;
    }

    // UPDATED: Validate that it contains only digits
    if (!/^\d+$/.test(cleanMobile)) {
      setMobileValidation({
        checking: false,
        available: false,
        message: t("validation.mobileNumbersOnly") || "Mobile number can only contain numbers",
      });
      return;
    }

    // If editing and mobile hasn't changed, mark as available without API call
    if (editingUser && cleanMobile === editingUser.mobileNo) {
      setMobileValidation({
        checking: false,
        available: true,
        message: t("validation.mobileUnchanged") || "Mobile number unchanged",
      });
      return;
    }

    // If we already validated this mobile and it's available, don't call API again
    if (
      mobileValidation.available === true &&
      mobileValidation.message.includes("available")
    ) {
      return;
    }

    setMobileValidation({
      checking: true,
      available: null,
      message: t("validation.mobileChecking") || "Checking mobile number availability...",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(
        cleanMobile
      );

      if (response.isSuccess) {
        setMobileValidation({
          checking: false,
          available: true,
          message: t("validation.mobileAvailable") || "Mobile number is available",
        });
      } else {
        setMobileValidation({
          checking: false,
          available: false,
          message: response.failureReason || t("validation.mobileAlreadyRegistered") || "Mobile number already registered",
        });
      }
    } catch (error: any) {
      console.error("Mobile validation error:", error);

      if (error.response?.status === 400) {
        setMobileValidation({
          checking: false,
          available: false,
          message:
            error.response.data?.failureReason ||
            t("validation.mobileAlreadyRegistered") || "Mobile number already registered",
        });
      } else {
        setMobileValidation({
          checking: false,
          available: null,
          message: t("validation.mobileCheckError") || "Error checking mobile number availability",
        });
      }
    }
  };

  // Debounced email validation handler
  const handleEmailChange = (email: string) => {
    setValue("email", email);

    // Clear existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateEmailAvailability(email);
    }, 800); // 800ms debounce

    setEmailDebounceTimer(timer);
  };

  // Debounced mobile validation handler
  const handleMobileChange = (mobileNo: string) => {
    setValue("mobileNo", mobileNo);

    // Clear existing timer
    if (mobileDebounceTimer) {
      clearTimeout(mobileDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateMobileAvailability(mobileNo);
    }, 800); // 800ms debounce

    setMobileDebounceTimer(timer);
  };

  // Add this useEffect to handle validation state updates
  useEffect(() => {
    if (emailValidation.available === false) {
      setError("email", {
        type: "manual",
        message: emailValidation.message,
      });
    } else if (emailValidation.available === true) {
      clearErrors("email");
    }

    if (mobileValidation.available === false) {
      setError("mobileNo", {
        type: "manual",
        message: mobileValidation.message,
      });
    } else if (mobileValidation.available === true) {
      clearErrors("mobileNo");
    }
  }, [
    emailValidation.available,
    mobileValidation.available,
    setError,
    clearErrors,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
      if (mobileDebounceTimer) clearTimeout(mobileDebounceTimer);
    };
  }, [emailDebounceTimer, mobileDebounceTimer]);

  // Fixed onSubmit function
  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      // Check if mutations are in progress
      if (createMutation.isPending || updateMutation.isPending) {
        toast.error(t("common.pleaseWait") || "Please wait for the current operation to complete");
        return;
      }

      // Check if email or mobile validations are in progress
      if (emailValidation.checking || mobileValidation.checking) {
        toast.error(t("common.pleaseWait") || "Please wait for email/mobile validation to complete");
        return;
      }

      // Enhanced validation checks - SIMPLIFIED
      const currentEmail = data.email;
      const currentMobile = data.mobileNo;

      // Email validation - only check if validation explicitly failed
      if (emailValidation.available === false) {
        toast.error(t("validation.fixEmailErrors") || "Please fix email validation errors before submitting");
        return;
      }

      // Mobile validation - only check if validation explicitly failed
      if (mobileValidation.available === false) {
        toast.error(
          t("validation.fixMobileErrors") || "Please fix mobile number validation errors before submitting"
        );
        return;
      }

      // For new users, ensure validations have completed
      if (!editingUser) {
        if (emailValidation.available === null && currentEmail) {
          // Trigger validation and wait briefly
          await validateEmailAvailability(currentEmail);
          if (emailValidation.checking) {
            toast.error(t("validation.waitEmailValidation") || "Please wait for email validation to complete");
            return;
          }
        }

        if (mobileValidation.available === null && currentMobile) {
          // Trigger validation and wait briefly
          await validateMobileAvailability(currentMobile);
          if (mobileValidation.checking) {
            toast.error(t("validation.waitMobileValidation") || "Please wait for mobile number validation to complete");
            return;
          }
        }
      }

      // All validations passed, proceed with submission
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
      toast.error(t("admin.users.cannotDeleteInvalidId") || "Cannot delete user: Invalid user ID");
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
      toast.error(t("admin.users.cannotDeleteInvalidId") || "Cannot delete user: Invalid user ID");
      setDeleteConfirmation({ isOpen: false, user: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, user: null });
  };

  const handleResetPassword = (user: User) => {
    if (!user.email) {
      toast.error(t("admin.users.cannotResetPassword") || "Cannot reset password: User email is missing");
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

    // Reset validation states
    setEmailValidation({
      checking: false,
      available: null,
      message: "",
    });
    setMobileValidation({
      checking: false,
      available: null,
      message: "",
    });
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setResettingUser(null);
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

      toast.success(t("admin.users.exportSuccess") || "Users exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = getErrorMessage(error, t("admin.users.exportError") || "Failed to export users");
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
            ? `${t("admin.users.user")}: ${deleteConfirmation.user.firstName} ${deleteConfirmation.user.lastName} (${deleteConfirmation.user.email})`
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
            <span className="font-medium">{t("common.errorLoading") || "Failed to load users"}</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {getErrorMessage(fetchError, t("common.retry") || "Please try again later")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.refetchQueries({ queryKey: ["users"] })}
            className="mt-2"
          >
            {t("common.retry") || "Retry"}
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
                    ? t("admin.partners.adjustSearch") || "Try adjusting your search or filter criteria"
                    : t("admin.users.noUsersCreated") || "No users have been created yet"}
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
                    {t("admin.users.addFirstUser") || "Add Your First User"}
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
            label={
              <>
                {t("admin.users.firstName") || "First Name"}
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            error={errors.firstName?.message}
            {...register("firstName")}
            required
            placeholder={t("admin.users.EnterfirstName") || "Enter first name"}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          <Input
            label={
              <>
                {t("admin.users.lastName") || "Last Name"}
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            error={errors.lastName?.message}
            {...register("lastName")}
            required
            placeholder={t("admin.users.EnterlastName") || "Enter last name"}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          {/* Updated Email Field with Validation */}
          <div className="space-y-1">
            <Input
              label={
                <>
                  {t("admin.users.email") || "Email"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              type="email"
              {...register("email")}
              value={watch("email") || ""}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={
                t("admin.users.Enteremailaddress") || "Enter email address"
              }
              className={
                emailValidation.available === false ? "border-red-500" : ""
              }
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            {emailValidation.checking && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                {t("validation.emailChecking") || "Checking availability..."}
              </div>
            )}
            {emailValidation.available === true &&
              !emailValidation.checking && (
                <div className="text-green-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {emailValidation.message}
                </div>
              )}
            {emailValidation.available === false &&
              !emailValidation.checking && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {emailValidation.message}
                </div>
              )}
            {/* Show Zod validation errors only if custom validation hasn't already shown an error */}
            {errors.email?.message && emailValidation.available !== false && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Updated Mobile Number Field with 8-digit Validation */}
          <div className="space-y-1">
            <Input
              label={
                <>
                  {t("admin.users.mobileNo") || "Mobile Number"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              {...register("mobileNo")}
              value={watch("mobileNo") || ""}
              onChange={(e) => handleMobileChange(e.target.value)}
              placeholder={t("admin.users.EntermobileNo") || "Mobile Number"}
              className={
                mobileValidation.available === false ? "border-red-500" : ""
              }
              maxLength={8}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            {mobileValidation.checking && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                {t("validation.mobileChecking") || "Checking availability..."}
              </div>
            )}
            {mobileValidation.available === true &&
              !mobileValidation.checking && (
                <div className="text-green-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {mobileValidation.message}
                </div>
              )}
            {mobileValidation.available === false &&
              !mobileValidation.checking && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {mobileValidation.message}
                </div>
              )}
            {/* Show Zod validation errors only if custom validation hasn't already shown an error */}
            {errors.mobileNo?.message &&
              mobileValidation.available !== false && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.mobileNo.message}
                </div>
              )}
          </div>

          {/* Toggle Switch for Active Status */}
          <ToggleSwitch
            label={t("common.active") || "Active"}
            checked={isActiveValue}
            onChange={(checked) => setValue("isActive", checked)}
          />

          {/* Improved Form validation summary */}
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
                {t("common.pleaseFixErrors") || "Please fix the following errors:"}
              </div>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.firstName && <li>{errors.firstName.message}</li>}
                {errors.lastName && <li>{errors.lastName.message}</li>}
                {errors.email?.message && <li>{errors.email.message}</li>}
                {errors.mobileNo?.message && <li>{errors.mobileNo.message}</li>}
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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t("common.Submitting") || "Submitting..."
                : editingUser
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <ResetPasswordModal
        open={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        onSuccess={() => {
          toast.success(
            t("admin.users.passwordResetSuccess", { email: resettingUser?.email }) || `Password reset successfully for ${resettingUser?.email}`
          );
          setResettingUser(null);
        }}
        targetUser={{
          email: resettingUser?.email || "",
          firstName: resettingUser?.firstName,
          lastName: resettingUser?.lastName,
        }}
      />
    </div>
  );
}
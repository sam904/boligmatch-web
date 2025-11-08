// src/features/admin/categories/CategoriesPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../../../services/category.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ImageUpload from "../../../components/common/ImageUpload";
import AdminToast from "../../../components/common/AdminToast";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useDbTranslation } from "../../../hooks/useDbTranslation";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "../../../types/category";
import ToggleSwitch from "../../../components/common/ToggleSwitch";
import TextArea from "../../../components/common/TextArea";
import {
  IconTrash,
  IconPencil,
  IconPlus,
  IconNoRecords,
  IconUpload,
} from "../../../components/common/Icons/Index";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import { exportToExcel } from "../../../utils/export.utils";

// Enhanced validation schema with dimension validation
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .min(1, "Image is required")
    .url("Please provide a valid image URL"),
  iconUrl: z
    .string()
    .min(1, "Icon is required")
    .url("Please provide a valid icon URL"),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

// Fixed Image Preview Modal Component
function ImagePreviewModal({
  imageUrl,
  isOpen,
  onClose,
}: {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setIsLoading(true);
      const img = new Image();
      img.onload = function () {
        setIsLoading(false);
      };
      img.onerror = function () {
        setIsLoading(false);
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Image Preview</h3>
          <button
            onClick={onClose}
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading image...</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
        <div className="p-4 border-t text-left">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { translateCategory } = useDbTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "InActive"
  >("All");
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    isOpen: boolean;
  }>({
    url: "",
    isOpen: false,
  });
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

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

    // Remove toast from state after animation
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

  // Fetch categories with server-side pagination, search and status filter
  const {
    data: paginatedData,
    isLoading,
    error: fetchError,
    isError: isFetchError,
  } = useQuery({
    queryKey: [
      "categories",
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      categoryService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter,
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Get data from API response
  const categories = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Check if there are any records to display
  const hasRecords = categories.length > 0;

  // Show fetch error toast
  useEffect(() => {
    if (isFetchError && fetchError) {
      const errorMessage = getErrorMessage(
        fetchError,
        "Failed to load categories"
      );
      toast.error(errorMessage);
    }
  }, [isFetchError, fetchError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      isActive: true,
      description: "",
      imageUrl: "",
      iconUrl: "",
    },
  });

  // Watch the form values
  const imageUrlValue = watch("imageUrl");
  const iconUrlValue = watch("iconUrl");
  const isActiveValue = watch("isActive");

  // Add dimension validation function
  const validateImageDimensions = async (
    imageUrl: string,
    requiredWidth: number,
    requiredHeight: number
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const isValid =
          img.width === requiredWidth && img.height === requiredHeight;
        resolve(isValid);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        description: editingCategory.description || "",
        imageUrl: editingCategory.imageUrl || "",
        iconUrl: editingCategory.iconUrl || "",
        isActive: editingCategory.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
        imageUrl: "",
        iconUrl: "",
        isActive: true,
      });
    }
  }, [editingCategory, reset]);

  // Create mutation with error handling
  const createMutation = useMutation({
    mutationFn: categoryService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
      toast.success(
        t("admin.categories.createSuccess") || "Category created successfully"
      );
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.categories.createError") || "Failed to create category"
      );
      toast.error(errorMessage);

      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof CategoryFormData, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      }
    },
  });

  // Update mutation with error handling
  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
      toast.success(
        t("admin.categories.updateSuccess") || "Category updated successfully"
      );
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.categories.updateError") || "Failed to update category"
      );
      toast.error(errorMessage);

      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof CategoryFormData, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      }
    },
  });

  // Delete mutation with error handling
  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
      toast.success(
        t("admin.categories.deleteSuccess") || "Category deleted successfully"
      );
      setDeleteConfirmation({ isOpen: false, category: null });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.categories.deleteError") || "Failed to delete category"
      );
      toast.error(errorMessage);
      setDeleteConfirmation({ isOpen: false, category: null });
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    // Final validation check
    const isFormValid = await trigger();
    if (!isFormValid) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    // Validate image dimensions before submission
    if (data.imageUrl) {
      const isImageValid = await validateImageDimensions(
        data.imageUrl,
        374,
        340
      );
      if (!isImageValid) {
        toast.error("Main image must be exactly 374 × 340 pixels");
        setError("imageUrl", {
          type: "manual",
          message: "Image must be exactly 374 × 340 pixels",
        });
        return;
      }
    }

    // Validate icon dimensions before submission
    if (data.iconUrl) {
      const isIconValid = await validateImageDimensions(data.iconUrl, 512, 512);
      if (!isIconValid) {
        toast.error("Icon must be exactly 512 × 512 pixels");
        setError("iconUrl", {
          type: "manual",
          message: "Icon must be exactly 512 × 512 pixels",
        });
        return;
      }
    }

    if (editingCategory) {
      updateMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createMutation.mutate(data);
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
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteCategory = (category: Category) => {
    if (!category.id) {
      toast.error("Cannot delete category: Invalid ID");
      return;
    }

    // Show delete confirmation modal
    setDeleteConfirmation({
      isOpen: true,
      category: category,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.category?.id) {
      deleteMutation.mutate(deleteConfirmation.category.id);
    } else {
      toast.error("Cannot delete category: Invalid ID");
      setDeleteConfirmation({ isOpen: false, category: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, category: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    clearErrors();
    reset();
  };

  const handleExportCategories = async () => {
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

      console.log("Exporting categories with params:", exportParams);
      await exportToExcel("Category", exportParams);

      toast.success("Categories exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to export categories"
      );
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: t("admin.categories.id") || "ID",
    },
    {
      accessorKey: "name",
      header: t("admin.categories.name") || "Name",
      cell: ({ row }) => translateCategory(row.original.name),
    },
    {
      accessorKey: "description",
      header: t("admin.categories.description") || "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        if (!description) return "-";

        return description.length > 50
          ? `${description.substring(0, 50)}...`
          : description;
      },
    },
    {
      accessorKey: "imageUrl",
      header: t("admin.categories.image") || "Image",
      enableSorting: false,
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        if (!imageUrl) return "-";

        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setPreviewImage({ url: imageUrl, isOpen: true })}
              className="underline text-sm font-medium text-left"
            >
              {t("admin.categories.image") || "Image"}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "iconUrl",
      header: t("admin.categories.icon") || "Icon",
      enableSorting: false,
      cell: ({ row }) => {
        const iconUrl = row.original.iconUrl;
        if (!iconUrl) return "-";

        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setPreviewImage({ url: iconUrl, isOpen: true })}
              className="underline text-sm font-medium text-left"
            >
              {t("admin.categories.icon") || "Icon"}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t("common.status") || "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="px-2 py-1 rounded-full text-xs text-white font-medium"
          style={{
            backgroundColor: row.original.isActive
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
              setEditingCategory(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.edit") || "Edit category"}
            disabled={updateMutation.isPending}
          >
            <IconPencil />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCategory(row.original)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.delete") || "Delete category"}
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

      {/* Delete Confirmation Modal using common component */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={
          deleteConfirmation.category
            ? `Category: ${translateCategory(deleteConfirmation.category.name)}`
            : undefined
        }
        confirmationMessage={
          t("admin.categories.deleteConfirm") ||
          "Are you sure you want to delete this category?"
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
                setEditingCategory(null);
                setIsModalOpen(true);
              }}
              icon={IconPlus}
              iconPosition="left"
              iconSize="w-5 h-5"
              disabled={createMutation.isPending}
            >
              {t("admin.categories.addCategory") || "Add Category"}
            </Button>
          </div>

          {/* Right side: Filters, SearchBar and Export button */}
          <div className="flex items-center gap-3">
            {/* Status Filter Dropdown */}
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
              onClick={handleExportCategories}
              disabled={isExporting || !hasRecords}
              icon={IconUpload}
              iconPosition="left"
              iconSize="w-5 h-5"
            >
              {isExporting
                ? t("common.exporting") || "Exporting..."
                : t("common.export") || "Export CSV"}
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
            <span className="font-medium">Failed to load categories</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {getErrorMessage(fetchError, "Please try again later")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ["categories"] })
            }
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
              <DataTable data={categories} columns={columns} />
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
                    : "No categories have been created yet"}
                </p>
                {!searchTerm && statusFilter === "All" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setEditingCategory(null);
                      setIsModalOpen(true);
                    }}
                    icon={IconPlus}
                    iconPosition="left"
                    iconSize="w-5 h-5"
                  >
                    {t("admin.categories.addCategory") ||
                      "Add Your First Category"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        open={isModalOpen}
        title={
          editingCategory
            ? t("admin.categories.editCategory") || "Edit Category"
            : t("admin.categories.addCategory") || "Add Category"
        }
        onClose={handleModalClose}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={
              <>
                {t("admin.categories.name") || "Category Name"}
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            error={errors.name?.message}
            {...register("name")}
            required
            maxLength={100}
            placeholder="Enter category name"
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          {/* Description TextArea */}
          <TextArea
            label={t("admin.categories.description") || "Description"}
            error={errors.description?.message}
            {...register("description")}
            maxLength={500}
            placeholder="Enter category description"
            rows={4}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          {/* Image Upload for Category Image with 374x340 validation */}
          <div
            className={
              createMutation.isPending || updateMutation.isPending
                ? "opacity-50 pointer-events-none"
                : ""
            }
          >
            <ImageUpload
              label={
                <>
                  {t("admin.categories.imageUrl") || "Image Upload"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              value={imageUrlValue}
              onChange={(url) => {
                setValue("imageUrl", url, { shouldValidate: true });
                trigger("imageUrl");
              }}
              onPreview={(url) => setPreviewImage({ url, isOpen: true })}
              folder="categories/images"
              error={errors.imageUrl?.message}
              exactDimensions={{ width: 374, height: 340 }}
              showDimensionValidation={true}
            />
          </div>

          {/* Image Upload for Category Icon with 512x512 validation */}
          <div
            className={
              createMutation.isPending || updateMutation.isPending
                ? "opacity-50 pointer-events-none"
                : ""
            }
          >
            <ImageUpload
              label={
                <>
                  {t("admin.categories.iconUrl") || "Icon Upload"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              value={iconUrlValue}
              onChange={(url) => {
                setValue("iconUrl", url, { shouldValidate: true });
                trigger("iconUrl");
              }}
              onPreview={(url) => setPreviewImage({ url, isOpen: true })}
              folder="categories/icons"
              error={errors.iconUrl?.message}
              exactDimensions={{ width: 512, height: 512 }}
              showDimensionValidation={true}
            />
          </div>

          {/* Status Dropdown */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register("isActive", {
                setValueAs: (value) => value === "true",
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <option value="true">Active</option>
              <option value="false">InActive</option>
            </select>
            {errors.isActive && (
              <p className="text-red-500 text-sm mt-1">
                {errors.isActive.message}
              </p>
            )}
          </div> */}

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
                {errors.name && <li>{errors.name.message}</li>}
                {errors.description && <li>{errors.description.message}</li>}
                {errors.imageUrl && <li>{errors.imageUrl.message}</li>}
                {errors.iconUrl && <li>{errors.iconUrl.message}</li>}
                {errors.isActive && <li>{errors.isActive.message}</li>}
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
                ? "Submitting..."
                : editingCategory
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: "", isOpen: false })}
      />
    </div>
  );
}

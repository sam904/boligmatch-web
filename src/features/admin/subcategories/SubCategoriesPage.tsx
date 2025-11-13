// src/features/admin/subcategories/SubCategoriesPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subCategoryService } from "../../../services/subCategory.service";
import { categoryService } from "../../../services/category.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import SearchableSelectController from "../../../components/common/SearchableSelectController";
import ImageUpload from "../../../components/common/ImageUpload";
import AdminToast from "../../../components/common/AdminToast";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useDbTranslation } from "../../../hooks/useDbTranslation";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type { SubCategory } from "../../../types/subcategory";
import {
  IconTrash,
  IconPencil,
  IconPlus,
  IconNoRecords,
} from "../../../components/common/Icons/Index";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

// Fixed validation schema
const subCategorySchema = z.object({
  categoryId: z.number().min(1, "Category is required"),
  name: z
    .string()
    .min(1, "Subcategory name is required")
    .max(100, "Subcategory name must be less than 100 characters"),
  imageUrl: z
    .string()
    .min(1, "Image is required")
    .url("Please provide a valid image URL"),
  iconUrl: z
    .string()
    .min(1, "Icon is required")
    .url("Please provide a valid icon URL"),
  isActive: z.boolean(),
  status: z.enum(["Active", "InActive"]),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

// Simplified Image Preview Modal Component
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

export default function SubCategoriesPage() {
  const { t } = useTranslation();
  const { translateCategory, translateSubCategory } = useDbTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
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
    subCategory: SubCategory | null;
  }>({
    isOpen: false,
    subCategory: null,
  });
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

  // Fetch subcategories with server-side pagination, search and status filter
  const {
    data: paginatedData,
    isLoading,
    error: fetchError,
    isError: isFetchError,
  } = useQuery({
    queryKey: [
      "subcategories",
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      subCategoryService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter,
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch categories - include inactive but we'll filter them
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    trigger,
    setValue,
    setError,
    clearErrors,
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    mode: "onChange",
    defaultValues: {
      categoryId: 0,
      name: "",
      imageUrl: "",
      iconUrl: "",
      isActive: true,
      status: "Active",
    },
  });

  // Watch form values
  const nameValue = watch("name");
  const imageUrlValue = watch("imageUrl");
  const iconUrlValue = watch("iconUrl");
  const isActiveValue = watch("isActive");

  // Filter categories to show only active ones
  const activeCategories = categories.filter(
    (category) => category.isActive === true
  );

  // Get data from API response
  const subCategories = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Check if there are any records to display
  const hasRecords = subCategories.length > 0;

  // Show fetch error toast
  useEffect(() => {
    if (isFetchError && fetchError) {
      const errorMessage = getErrorMessage(
        fetchError,
        "Failed to load subcategories"
      );
      toast.error(errorMessage);
    }
  }, [isFetchError, fetchError]);

  // Show categories error using custom toast
  useEffect(() => {
    if (categoriesError) {
      const errorMessage = getErrorMessage(
        categoriesError,
        "Failed to load categories"
      );
      toast.error(errorMessage);
    }
  }, [categoriesError]);

  useEffect(() => {
    if (editingSubCategory) {
      reset({
        categoryId: editingSubCategory.categoryId,
        name: editingSubCategory.name,
        imageUrl: editingSubCategory.imageUrl || "",
        iconUrl: editingSubCategory.iconUrl || "",
        isActive: editingSubCategory.isActive,
        status: editingSubCategory.isActive ? "Active" : "InActive",
      });
    } else {
      // Set default category when active categories are loaded
      reset({
        categoryId: 0,
        name: "",
        imageUrl: "",
        iconUrl: "",
        isActive: true,
        status: "Active",
      });
    }
  }, [editingSubCategory, reset]);

  const createMutation = useMutation({
    mutationFn: subCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
        exact: false,
      });
      toast.success(
        t("admin.subcategories.createSuccess") ||
          "Subcategory created successfully"
      );
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.subcategories.createError") || "Failed to create subcategory"
      );
      toast.error(errorMessage);

      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof SubCategoryFormData, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: subCategoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
        exact: false,
      });
      toast.success(
        t("admin.subcategories.updateSuccess") ||
          "Subcategory updated successfully"
      );
      setIsModalOpen(false);
      setEditingSubCategory(null);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.subcategories.updateError") || "Failed to update subcategory"
      );
      toast.error(errorMessage);

      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof SubCategoryFormData, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      }
    },
  });

  // Delete mutation with error handling
  const deleteMutation = useMutation({
    mutationFn: (id: number) => subCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
        exact: false,
      });
      toast.success(
        t("admin.subcategories.deleteSuccess") ||
          "Subcategory deleted successfully"
      );
      setDeleteConfirmation({ isOpen: false, subCategory: null });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        t("admin.subcategories.deleteError") || "Failed to delete subcategory"
      );
      toast.error(errorMessage);
      setDeleteConfirmation({ isOpen: false, subCategory: null });
    },
  });

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

  const onSubmit: SubmitHandler<SubCategoryFormData> = async (data) => {
    try {
      // Check if mutations are in progress
      if (createMutation.isPending || updateMutation.isPending) {
        toast.error("Please wait for the current operation to complete");
        return;
      }

      // Final validation check - but don't block if there are minor issues
      const isFormValid = await trigger();
      if (!isFormValid) {
        // Instead of blocking, show what needs to be fixed
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
          toast.error(`Please fix errors in: ${errorFields.join(", ")}`);
        }
        return;
      }

      // Additional check for active category
      const selectedCategory = activeCategories.find(
        (cat) => cat.id === data.categoryId
      );
      if (!selectedCategory) {
        toast.error("Please select an active category");
        return;
      }

      // Validate image dimensions before submission - but make it non-blocking for existing images
      if (data.imageUrl) {
        // Only validate dimensions for new images or if image has changed
        const isNewImage =
          !editingSubCategory || data.imageUrl !== editingSubCategory.imageUrl;
        if (isNewImage) {
          const isImageValid = await validateImageDimensions(
            data.imageUrl,
            1440,
            710
          );
          if (!isImageValid) {
            toast.error("Main image must be exactly 1440 × 710 pixels");
            setError("imageUrl", {
              type: "manual",
              message: "Image must be exactly 1440 × 710 pixels",
            });
            return;
          }
        }
      }

      // Validate icon dimensions before submission - but make it non-blocking for existing icons
      if (data.iconUrl) {
        // Only validate dimensions for new icons or if icon has changed
        const isNewIcon =
          !editingSubCategory || data.iconUrl !== editingSubCategory.iconUrl;
        if (isNewIcon) {
          const isIconValid = await validateImageDimensions(
            data.iconUrl,
            512,
            512
          );
          if (!isIconValid) {
            toast.error("Icon must be exactly 512 × 512 pixels");
            setError("iconUrl", {
              type: "manual",
              message: "Icon must be exactly 512 × 512 pixels",
            });
            return;
          }
        }
      }

      // All validations passed, proceed with submission
      if (editingSubCategory) {
        updateMutation.mutate({ ...data, id: editingSubCategory.id });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
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

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    if (!subCategory.id) {
      toast.error("Cannot delete subcategory: Invalid ID");
      return;
    }

    // Show delete confirmation modal instead of window.confirm
    setDeleteConfirmation({
      isOpen: true,
      subCategory: subCategory,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.subCategory?.id) {
      deleteMutation.mutate(deleteConfirmation.subCategory.id);
    } else {
      toast.error("Cannot delete subcategory: Invalid ID");
      setDeleteConfirmation({ isOpen: false, subCategory: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, subCategory: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
    clearErrors();
    reset();
  };

  const handleModalOpen = () => {
    if (activeCategories.length === 0 && !categoriesLoading) {
      toast.error(
        "No active categories available. Please create an active category first."
      );
      return;
    }
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  // Prepare category options for dropdown - only active categories
  const categoryOptions = activeCategories.map((category) => ({
    value: category.id,
    label: translateCategory(category.name),
  }));

  const columns: ColumnDef<SubCategory>[] = [
    {
      accessorKey: "id",
      header: t("admin.subcategories.id") || "ID",
    },
    {
      accessorKey: "name",
      header: t("admin.subcategories.name") || "Name",
      cell: ({ row }) => translateSubCategory(row.original.name),
    },
    {
      accessorKey: "categoryName",
      header: t("admin.subcategories.category") || "Category",
      cell: ({ row }) => {
        const category = categories.find(
          (c) => c.id === row.original.categoryId
        );
        return category ? translateCategory(category.name) : "-";
      },
    },
    {
      accessorKey: "imageUrl",
      header: t("admin.subcategories.image") || "Image",
      enableSorting: false,
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        if (!imageUrl) return "-";

        return (
          <button
            onClick={() => setPreviewImage({ url: imageUrl, isOpen: true })}
            className="underline text-sm font-medium"
          >
            {t("admin.subcategories.image") || "Image"}
          </button>
        );
      },
    },
    {
      accessorKey: "iconUrl",
      header: t("admin.subcategories.icon") || "Icon",
      enableSorting: false,
      cell: ({ row }) => {
        const iconUrl = row.original.iconUrl;
        if (!iconUrl) return "-";

        return (
          <button
            onClick={() => setPreviewImage({ url: iconUrl, isOpen: true })}
            className="underline text-sm font-medium"
          >
            {t("admin.subcategories.icon") || "Icon"}
          </button>
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
            backgroundColor:
              row.original.isActive === true
                ? "var(--color-secondary)"
                : "var(--color-neutral)",
          }}
        >
          {row.original.isActive === true
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
              setEditingSubCategory(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.edit") || "Edit subcategory"}
            disabled={updateMutation.isPending}
          >
            <IconPencil />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteSubCategory(row.original)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.delete") || "Delete subcategory"}
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
          deleteConfirmation.subCategory
            ? `Subcategory: ${translateSubCategory(
                deleteConfirmation.subCategory.name
              )}`
            : undefined
        }
        confirmationMessage={
          t("admin.subcategories.deleteConfirm") ||
          "Are you sure you want to delete this subcategory?"
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
              onClick={handleModalOpen}
              disabled={
                categoriesLoading ||
                activeCategories.length === 0 ||
                createMutation.isPending
              }
              icon={IconPlus}
              iconPosition="left"
              iconSize="w-5 h-5"
            >
              {t("admin.subcategories.addSubCategory") || "Add Subcategory"}
            </Button>
          </div>
          {/* Right side: Filters, SearchBar and Add Subcategory button */}
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
            <span className="font-medium">Failed to load subcategories</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {getErrorMessage(fetchError, "Please try again later")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ["subcategories"] })
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
              <DataTable data={subCategories} columns={columns} />
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
                    : "No subcategories have been created yet"}
                </p>
                {!searchTerm && statusFilter === "All" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleModalOpen}
                    disabled={
                      categoriesLoading || activeCategories.length === 0
                    }
                    icon={IconPlus}
                    iconPosition="left"
                    iconSize="w-5 h-5"
                  >
                    {t("admin.subcategories.addSubCategory") ||
                      "Add Your First Subcategory"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subcategory Form Modal */}
      <Modal
        open={isModalOpen}
        title={
          editingSubCategory
            ? t("admin.subcategories.editSubCategory") || "Edit Subcategory"
            : t("admin.subcategories.addSubCategory") || "Add Subcategory"
        }
        onClose={handleModalClose}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Dropdown - only active categories */}
          <SearchableSelectController
            name="categoryId"
            control={control}
            label={
              <>
                {t("admin.subcategories.category") || "Category"}
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            error={errors.categoryId?.message}
            options={categoryOptions}
            placeholder={
              categoriesLoading
                ? "Loading categories..."
                : activeCategories.length === 0
                ? "No active categories available"
                : "Select Category"
            }
            disabled={
              categoriesLoading ||
              activeCategories.length === 0 ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          />

          {/* Show warning if no active categories */}
          {!categoriesLoading && activeCategories.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
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
                <span className="text-sm font-medium">
                  No Active Categories Available
                </span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                You need to create an active category before adding
                subcategories.
              </p>
            </div>
          )}

          {/* Subcategory Name */}
          <Input
            label={
              <>
                {t("admin.subcategories.name") || "Subcategory Name"}
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            error={errors.name?.message}
            {...register("name")}
            required
            maxLength={100}
            placeholder="Enter subcategory name"
            disabled={
              activeCategories.length === 0 ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          />

          {/* Character count */}
          <div className="text-xs text-gray-500 -mt-2">
            {nameValue?.length || 0}/100 characters
          </div>

          {/* Image Upload for Subcategory Image */}
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
                  {t("admin.subcategories.imageUrl") || "Image Upload"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              value={imageUrlValue}
              onChange={(url) => {
                setValue("imageUrl", url, { shouldValidate: true });
                setTimeout(() => trigger(), 50);
              }}
              onPreview={(url) => setPreviewImage({ url, isOpen: true })}
              folder="subcategories/images"
              error={errors.imageUrl?.message}
              exactDimensions={{ width: 1440, height: 710 }}
              showDimensionValidation={true}
            />
          </div>

          {/* Image Upload for Subcategory Icon */}
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
                  {t("admin.subcategories.iconUrl") || "Icon Upload"}
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              value={iconUrlValue}
              onChange={(url) => {
                setValue("iconUrl", url, { shouldValidate: true });
                setTimeout(() => trigger(), 50);
              }}
              onPreview={(url) => setPreviewImage({ url, isOpen: true })}
              folder="subcategories/icons"
              error={errors.iconUrl?.message}
              exactDimensions={{ width: 512, height: 512 }}
              showDimensionValidation={true}
            />
          </div>

          <ToggleSwitch
            label={t("common.active") || "Active"}
            checked={isActiveValue}
            onChange={(checked) => {
              setValue("isActive", checked);
              setValue("status", checked ? "Active" : "InActive", {
                shouldValidate: true,
              });
              trigger();
            }}
          />

          {/* Validation Summary */}
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
                {errors.categoryId && <li>{errors.categoryId.message}</li>}
                {errors.name && <li>{errors.name.message}</li>}
                {errors.imageUrl && <li>{errors.imageUrl.message}</li>}
                {errors.iconUrl && <li>{errors.iconUrl.message}</li>}
                {errors.status && <li>{errors.status.message}</li>}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
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
                ? "Submitting..."
                : editingSubCategory
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

// src/features/admin/categories/CategoriesPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../../../services/category.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ImageUpload from "../../../components/common/ImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useDbTranslation } from "../../../hooks/useDbTranslation";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "../../../types/category";
import TextArea from "../../../components/common/TextArea";
import {
  IconTrash,
  IconPencil,
  IconPlus,
} from "../../../components/common/Icons/Index";
import { FilterDropdown } from "../../../components/common/FilterDropdown";
import ToggleSwitch from "../../../components/common/ToggleSwitch"; // Add this import

// Enhanced validation schema with dimension validation
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .min(1, "Image is required")
    .url("Please provide a valid image URL")
    .refine(
      () => {
        return true;
      },
      {
        message: "Image must be exactly 374 × 340 pixels",
      }
    ),
  iconUrl: z
    .string()
    .min(1, "Icon is required")
    .url("Please provide a valid icon URL")
    .refine(
      () => {
        return true;
      },
      {
        message: "Icon must be exactly 512 × 512 pixels",
      }
    ),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Fixed Image Preview Modal Component - removed unused dimensions
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
    "all" | "active" | "inactive"
  >("all");
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    isOpen: boolean;
  }>({
    url: "",
    isOpen: false,
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Fetch categories with server-side pagination and search only
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["categories", currentPage, pageSize, debouncedSearchTerm],
    queryFn: () =>
      categoryService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
      }),
  });

  // Get data from API response
  const categories = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Apply client-side status filtering only
  const filteredCategories = useMemo(() => {
    if (statusFilter === "all") {
      return categories; // Return all categories from server
    } else if (statusFilter === "active") {
      return categories.filter((category) => category.isActive === true);
    } else if (statusFilter === "inactive") {
      return categories.filter((category) => category.isActive === false);
    }
    return categories;
  }, [categories, statusFilter]);

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
      toast.error(
        error?.message ||
          t("admin.categories.createError") ||
          "Failed to create category"
      );

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
      toast.error(
        error?.message ||
          t("admin.categories.updateError") ||
          "Failed to update category"
      );

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

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
      toast.success(
        t("admin.categories.deleteSuccess") || "Category deleted successfully"
      );
    },
    onError: () =>
      toast.error(
        t("admin.categories.deleteError") || "Failed to delete category"
      ),
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

  const handleStatusFilterChange = (filter: "all" | "active" | "inactive") => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteCategory = (category: Category) => {
    if (!category.id) return;

    const categoryName = translateCategory(category.name);
    const confirmMessage =
      t("admin.categories.deleteConfirm") ||
      "Are you sure you want to delete this category?";

    toast(
      <div className="w-full">
        <div className="font-semibold text-gray-900 mb-2">Confirm Deletion</div>
        <div className="text-sm text-gray-600 mb-4">
          {confirmMessage}
          <br />
          <strong>Category: {categoryName}</strong>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => toast.dismiss()}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              deleteMutation.mutate(category.id);
              toast.dismiss();
            }}
          >
            Delete
          </Button>
        </div>
      </div>,
      {
        duration: 10000,
        position: "top-center",
        closeButton: true,
      }
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    clearErrors();
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
              Image
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
              Icon
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
          >
            <IconPencil />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCategory(row.original)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={t("common.delete") || "Delete category"}
          >
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="p-2 mb-2">
        <div className="flex justify-between items-center">
          <div>
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
              {t("admin.categories.addCategory") || "Add Category"}
            </Button>
          </div>

          {/* Right side: Filters, SearchBar */}
          <div className="flex items-center gap-4">
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
        /* Data Table - Use filteredCategories for display */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable data={filteredCategories} columns={columns} />
          <div className="px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
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
            label={t("admin.categories.name") || "Category Name"}
            error={errors.name?.message}
            {...register("name")}
            required
            maxLength={100}
            placeholder="Enter category name"
          />

          {/* Description TextArea */}
          <TextArea
            label={t("admin.categories.description") || "Description"}
            error={errors.description?.message}
            {...register("description")}
            maxLength={500}
            placeholder="Enter category description"
            rows={4}
          />

          {/* Image Upload for Category Image with 1440x710 validation */}
          <ImageUpload
            label={`${t("admin.categories.imageUrl") || "Image Upload"} *`}
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

          {/* Image Upload for Category Icon with 512x512 validation */}
          <ImageUpload
            label={`${t("admin.categories.iconUrl") || "Icon Upload"} *`}
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
                {errors.name && <li>{errors.name.message}</li>}
                {errors.description && <li>{errors.description.message}</li>}
                {errors.imageUrl && <li>{errors.imageUrl.message}</li>}
                {errors.iconUrl && <li>{errors.iconUrl.message}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              className="flex-1"
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
              {editingCategory
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

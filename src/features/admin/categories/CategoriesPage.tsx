// src/features/admin/categories/CategoriesPage.tsx
import { useState, useEffect, useMemo } from 'react'; // Add useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../../services/category.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Pagination from '../../../components/common/Pagination';
import SearchBar from '../../../components/common/SearchBar';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import ImageUpload from '../../../components/common/ImageUpload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDbTranslation } from '../../../hooks/useDbTranslation';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ColumnDef } from '@tanstack/react-table';
import type { Category } from '../../../types/category';
import { FaEdit, FaTrash } from "react-icons/fa";
import TextArea from '../../../components/common/TextArea';

// Enhanced validation schema with required imageUrl
const categorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters") // Add description validation
    .optional(),
  imageUrl: z.string()
    .min(1, "Image Upload is required")
    .url("Please add a valid image"),
  iconUrl: z.string()
    .min(1, "Icon Upload is required")
    .url("Please add a valid icon"),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Image Preview Modal Component
function ImagePreviewModal({ imageUrl, isOpen, onClose }: { imageUrl: string; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Image Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="p-4 border-t text-center">
          <a 
            href={imageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Open original image in new tab
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
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active'); // Add status filter state
  const [previewImage, setPreviewImage] = useState<{ url: string; isOpen: boolean }>({
    url: '',
    isOpen: false
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Fetch all categories without filtering
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['categories', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => categoryService.getPaginated({
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
    setValue, 
    watch,
    trigger,
    setError,
    clearErrors
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      isActive: true,
      description: '',
      imageUrl: '',
      iconUrl: '',
    },
  });

  // Watch the form values
  const imageUrlValue = watch('imageUrl');
  const iconUrlValue = watch('iconUrl');
  const nameValue = watch('name');
  const descriptionValue = watch('description');

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        description: editingCategory.description || '',
        imageUrl: editingCategory.imageUrl || '',
        iconUrl: editingCategory.iconUrl || '',
        isActive: editingCategory.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        imageUrl: '',
        iconUrl: '',
        isActive: true,
      });
    }
  }, [editingCategory, reset]);

  const createMutation = useMutation({
    mutationFn: categoryService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success(t('admin.categories.createSuccess') || "Category created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t('admin.categories.createError') || "Failed to create category");
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof CategoryFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success(t('admin.categories.updateSuccess') || "Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t('admin.categories.updateError') || "Failed to update category");
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof CategoryFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success(t('admin.categories.deleteSuccess') || "Category deleted successfully");
    },
    onError: () => toast.error(t('admin.categories.deleteError') || "Failed to delete category"),
  });

  const onSubmit = async (data: CategoryFormData) => {
    // Trigger final validation to ensure all fields are valid
    const isFormValid = await trigger();
    
    if (!isFormValid) {
      toast.error("Please fix the validation errors before submitting");
      return;
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
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteCategory = (category: Category) => {
    if (!category.id) return;
    
    const categoryName = translateCategory(category.name);
    const confirmMessage = t('admin.categories.deleteConfirm') || "Are you sure you want to delete this category?";
    
    toast(
      <div className="w-full">
        <div className="font-semibold text-gray-900 mb-2">Confirm Deletion</div>
        <div className="text-sm text-gray-600 mb-4">
          {confirmMessage}
          <br />
          <strong>Category: {categoryName}</strong>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.dismiss()}
          >
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
        duration: 10000, // 10 seconds
        position: 'top-center',
        closeButton: true,
      }
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    clearErrors();
  };

  // Get all categories from API response
  const allCategories = paginatedData?.items || [];

  // Apply client-side filtering based on status filter
  const filteredCategories = useMemo(() => {
    let filtered = allCategories;

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(category => category.isActive === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(category => category.isActive === false);
    }
    // If statusFilter is 'all', no filtering needed

    return filtered;
  }, [allCategories, statusFilter]);

  // For pagination, we need to handle the filtered data
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, pageSize]);

  const columns: ColumnDef<Category>[] = [
    { 
      accessorKey: 'id', 
      header: t('admin.categories.id') || "ID",
    },
    { 
      accessorKey: 'name', 
      header: t('admin.categories.name') || "Name",
      cell: ({ row }) => translateCategory(row.original.name)
    },
    {
      accessorKey: 'description',
      header: t('admin.categories.description') || "Description", // Add description column
      cell: ({ row }) => {
        const description = row.original.description;
        if (!description) return '-';
        
        // Truncate long descriptions
        return description.length > 50 
          ? `${description.substring(0, 50)}...` 
          : description;
      },
    },
    {
      accessorKey: 'imageUrl',
      header: t('admin.categories.image') || "Image",
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        if (!imageUrl) return '-';
        
        return (
          <button
            onClick={() => setPreviewImage({ url: imageUrl, isOpen: true })}
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            View Image
          </button>
        );
      },
    },
    {
      accessorKey: 'iconUrl',
      header: t('admin.categories.icon') || "Icon",
      cell: ({ row }) => {
        const iconUrl = row.original.iconUrl;
        if (!iconUrl) return '-';
        
        return (
          <button
            onClick={() => setPreviewImage({ url: iconUrl, isOpen: true })}
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            View Icon
          </button>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: t('common.status') || "Status",
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ 
            backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
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
          <button
            type="button"
            onClick={() => {
              setEditingCategory(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 text-gray-600 transition-colors hover:text-blue-600"
            title={t('common.edit') || "Edit category"}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCategory(row.original)}
            className="p-2 text-red-600 transition-colors hover:text-red-700"
            title={t('common.delete') || "Delete category"}
          >
            <FaTrash className="w-4 h-4" />
          </button>
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
            <h1 className="text-xl font-bold text-gray-900">{t('admin.categories.title') || "Categories"}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.categories.subtitle') || "Manage all categories"}</p>
          </div>

          {/* Right side: Filters, SearchBar and Add Category button */}
          <div className="flex items-center gap-4">
            {/* Status Filter Dropdown */}
            <div className="w-32">
              <select 
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="w-64">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingCategory(null);
                setIsModalOpen(true);
              }}
            >
              {t('admin.categories.addCategory') || "Add Category"}
            </Button>
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

      {/* Category Form Modal */}
      <Modal
        open={isModalOpen}
        title={editingCategory ? t('admin.categories.editCategory') || "Edit Category" : t('admin.categories.addCategory') || "Add Category"}
        onClose={handleModalClose}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label={t('admin.categories.name') || "Category Name"} 
            error={errors.name?.message}
            {...register('name')}
            required
            maxLength={100}
            placeholder="Enter category name"
          />
          
          {/* Character count for name */}
          <div className="text-xs text-gray-500 -mt-2">
            {nameValue?.length || 0}/100 characters
          </div>

          {/* Description TextArea */}
          <TextArea
            label={t('admin.categories.description') || "Description"}
            error={errors.description?.message}
            {...register('description')}
            maxLength={500}
            placeholder="Enter category description (optional)"
            rows={4}
          />
          
          {/* Character count for description */}
          <div className="text-xs text-gray-500 -mt-2">
            {descriptionValue?.length || 0}/500 characters
          </div>
          
          {/* Image Upload for Category Image - Now Required */}
          <ImageUpload
            label={`${t('admin.categories.imageUrl') || "Image Upload"} *`}
            value={imageUrlValue}
            onChange={(url) => {
              setValue('imageUrl', url, { shouldValidate: true });
              trigger('imageUrl');
            }}
            onPreview={(url) => setPreviewImage({ url, isOpen: true })} 
            folder="categories/images"
            error={errors.imageUrl?.message}
          />

          {/* Image Upload for Category Icon - Now Required */}
          <ImageUpload
            label={`${t('admin.categories.iconUrl') || "Icon Upload"} *`}
            value={iconUrlValue}
            onChange={(url) => {
              setValue('iconUrl', url, { shouldValidate: true });
              trigger('iconUrl');
            }}
            onPreview={(url) => setPreviewImage({ url, isOpen: true })}
            folder="categories/icons"
            error={errors.iconUrl?.message}
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
                {errors.name && <li>{errors.name.message}</li>}
                {errors.description && <li>{errors.description.message}</li>}
                {errors.imageUrl && <li>{errors.imageUrl.message}</li>}
                {errors.iconUrl && <li>{errors.iconUrl.message}</li>}
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
              {editingCategory ? t('common.update') || "Update" : t('common.create') || "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: '', isOpen: false })}
      />
    </div>
  );
}
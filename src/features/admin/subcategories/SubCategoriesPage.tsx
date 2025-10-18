// src/features/admin/subcategories/SubCategoriesPage.tsx
import { useState, useEffect, useMemo } from 'react'; // Add useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subCategoryService } from '../../../services/subCategory.service';
import { categoryService } from '../../../services/category.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Pagination from '../../../components/common/Pagination';
import SearchBar from '../../../components/common/SearchBar';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import SearchableSelectController from '../../../components/common/SearchableSelectController';
import ImageUpload from '../../../components/common/ImageUpload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDbTranslation } from '../../../hooks/useDbTranslation';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ColumnDef } from '@tanstack/react-table';
import type { SubCategory } from '../../../types/subcategory';
import { FaEdit, FaTrash } from "react-icons/fa";

// Enhanced validation schema
const subCategorySchema = z.object({
  categoryId: z.number().min(1, 'Category is required'),
  name: z.string()
    .min(1, 'Subcategory name is required')
    .max(100, 'Subcategory name must be less than 100 characters'),
  imageUrl: z.string()
    .min(1, 'Image Upload is required')
    .url('Please enter a valid image'),
  iconUrl: z.string()
    .min(1, 'Icon Upload is required')
    .url('Please enter a valid icon'),
  isActive: z.boolean(),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

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

export default function SubCategoriesPage() {
  const { t } = useTranslation();
  const { translateCategory, translateSubCategory } = useDbTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
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

  // Fetch subcategories without filtering
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['subcategories', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => subCategoryService.getPaginated({
      page: currentPage,
      pageSize,
      searchTerm: debouncedSearchTerm || undefined,
    }),
  });

  // Fetch categories - include inactive but we'll filter them
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors, isValid }, 
    reset,
    watch,
    trigger,
    setValue,
    setError,
    clearErrors
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    mode: 'onChange',
    defaultValues: {
      categoryId: 0,
      name: '',
      imageUrl: '',
      iconUrl: '',
      isActive: true,
    },
  });

  // Watch form values
  const nameValue = watch('name');
  const imageUrlValue = watch('imageUrl');
  const iconUrlValue = watch('iconUrl');

  // Filter categories to show only active ones
  const activeCategories = categories.filter(category => category.isActive === true);

  useEffect(() => {
    if (editingSubCategory) {
      reset({
        categoryId: editingSubCategory.categoryId,
        name: editingSubCategory.name,
        imageUrl: editingSubCategory.imageUrl || '',
        iconUrl: editingSubCategory.iconUrl || '',
        isActive: editingSubCategory.isActive,
      });
    } else {
      // Set default category when active categories are loaded
       reset({
          categoryId: 0,
          name: '',
          imageUrl: '',
          iconUrl: '',
          isActive: true,
        });
    }
  }, [editingSubCategory, reset]);

  // Show categories error
  useEffect(() => {
    if (categoriesError) {
      toast.error('Failed to load categories');
    }
  }, [categoriesError]);

  const createMutation = useMutation({
    mutationFn: subCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.createSuccess') || 'Subcategory created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t('admin.subcategories.createError') || 'Failed to create subcategory');
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof SubCategoryFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: subCategoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.updateSuccess') || 'Subcategory updated successfully');
      setIsModalOpen(false);
      setEditingSubCategory(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || t('admin.subcategories.updateError') || 'Failed to update subcategory');
      
      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as keyof SubCategoryFormData, {
            type: 'server',
            message: backendErrors[key][0]
          });
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subCategoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.deleteSuccess') || 'Subcategory deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || t('admin.subcategories.deleteError') || 'Failed to delete subcategory');
    },
  });

  const onSubmit = async (data: SubCategoryFormData) => {
    // Final validation check
    const isFormValid = await trigger();
    if (!isFormValid) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    // Additional check for active category
    const selectedCategory = activeCategories.find(cat => cat.id === data.categoryId);
    if (!selectedCategory) {
      toast.error('Please select an active category');
      return;
    }

    if (editingSubCategory) {
      updateMutation.mutate({ ...data, id: editingSubCategory.id });
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

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    if (!subCategory.id) return;
    
    const confirmMessage = t('admin.subcategories.deleteConfirm') || 'Are you sure you want to delete this subcategory?';
    
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate(subCategory.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
    clearErrors();
    reset();
  };

  const handleModalOpen = () => {
    if (activeCategories.length === 0 && !categoriesLoading) {
      toast.error('No active categories available. Please create an active category first.');
      return;
    }
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  // Get all subcategories from API response
  const allSubCategories = paginatedData?.data || [];

  // Apply client-side filtering based on status filter
  const filteredSubCategories = useMemo(() => {
    let filtered = allSubCategories;

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(subCategory => subCategory.isActive === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(subCategory => subCategory.isActive === false);
    }
    // If statusFilter is 'all', no filtering needed

    return filtered;
  }, [allSubCategories, statusFilter]);

  // For pagination, we need to handle the filtered data
  const totalItems = filteredSubCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSubCategories.slice(startIndex, endIndex);
  }, [filteredSubCategories, currentPage, pageSize]);

  // Prepare category options for dropdown - only active categories
  const categoryOptions = activeCategories.map(category => ({
    value: category.id,
    label: translateCategory(category.name)
  }));

  const columns: ColumnDef<SubCategory>[] = [
    { 
      accessorKey: 'id', 
      header: t('admin.subcategories.id') || 'ID',
    },
    { 
      accessorKey: 'name', 
      header: t('admin.subcategories.name') || 'Name',
      cell: ({ row }) => translateSubCategory(row.original.name)
    },
    {
      accessorKey: 'categoryName',
      header: t('admin.subcategories.category') || 'Category',
      cell: ({ row }) => {
        const category = categories.find(c => c.id === row.original.categoryId);
        return category ? translateCategory(category.name) : '-';
      },
    },
    {
      accessorKey: 'imageUrl',
      header: t('admin.subcategories.image') || 'Image',
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
      header: t('admin.subcategories.icon') || 'Icon',
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
      header: t('common.status') || 'Status',
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ 
            backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
          }}
        >
          {row.original.isActive ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
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
              setEditingSubCategory(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 text-gray-600 transition-colors"
            title={t('common.edit') || "Edit user"}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteSubCategory(row.original)}
            className="p-2 text-red-600 transition-colors"
            title={t('common.delete') || "Delete user"}
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
            <h1 className="text-xl font-bold text-gray-900">{t('admin.subcategories.title') || 'Subcategories'}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.subcategories.subtitle') || 'Manage subcategories linked to categories'}</p>
          </div>

          {/* Right side: Filters, SearchBar and Add Subcategory button */}
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
                //placeholder={t('admin.subcategories.searchPlaceholder') || 'Search subcategories...'}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleModalOpen}
              disabled={categoriesLoading || activeCategories.length === 0}
            >
              {t('admin.subcategories.addSubCategory') || 'Add Subcategory'}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-3 text-sm text-gray-600">{t('common.loading') || 'Loading...'}</p>
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

      {/* Subcategory Form Modal */}
      <Modal
        open={isModalOpen}
        title={editingSubCategory ? 
          (t('admin.subcategories.editSubCategory') || 'Edit Subcategory') : 
          (t('admin.subcategories.addSubCategory') || 'Add Subcategory')
        }
        onClose={handleModalClose}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Dropdown - only active categories */}
          <SearchableSelectController
            name="categoryId"
            control={control}
            label={t('admin.subcategories.category') || 'Category'}
            error={errors.categoryId?.message}
            options={categoryOptions}
            placeholder={
              categoriesLoading 
                ? "Loading categories..." 
                : activeCategories.length === 0 
                  ? "No active categories available" 
                  : "Select Category"
            }
            disabled={categoriesLoading || activeCategories.length === 0}
            //required
          />

          {/* Show warning if no active categories */}
          {!categoriesLoading && activeCategories.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium">No Active Categories Available</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                You need to create an active category before adding subcategories.
              </p>
            </div>
          )}

          {/* Subcategory Name */}
          <Input 
            label={`${t('admin.subcategories.name') || 'Subcategory Name'} *`}
            error={errors.name?.message}
            {...register('name')}
            required
            maxLength={100}
            placeholder="Enter subcategory name"
            disabled={activeCategories.length === 0}
          />
          
          {/* Character count */}
          <div className="text-xs text-gray-500 -mt-2">
            {nameValue?.length || 0}/100 characters
          </div>

          {/* Image Upload for Subcategory Image */}
          <ImageUpload
            label={`${t('admin.subcategories.imageUrl') || 'Image Upload'} *`}
            value={imageUrlValue}
            onChange={(url) => {
              setValue('imageUrl', url, { shouldValidate: true });
              trigger('imageUrl');
            }}
            onPreview={(url) => setPreviewImage({ url, isOpen: true })}
            folder="subcategories/images"
            error={errors.imageUrl?.message}
            //disabled={activeCategories.length === 0}
          />

          {/* Image Upload for Subcategory Icon */}
          <ImageUpload
            label={`${t('admin.subcategories.iconUrl') || 'Icon Upload'} *`}
            value={iconUrlValue}
            onChange={(url) => {
              setValue('iconUrl', url, { shouldValidate: true });
              trigger('iconUrl');
            }}
            onPreview={(url) => setPreviewImage({ url, isOpen: true })}
            folder="subcategories/icons"
            error={errors.iconUrl?.message}
            //disabled={activeCategories.length === 0}
          />

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive" 
              {...register('isActive')} 
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              disabled={activeCategories.length === 0}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              {t('common.active') || 'Active'}
            </label>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Please fix the following errors:
              </div>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.categoryId && <li>{errors.categoryId.message}</li>}
                {errors.name && <li>{errors.name.message}</li>}
                {errors.imageUrl && <li>{errors.imageUrl.message}</li>}
                {errors.iconUrl && <li>{errors.iconUrl.message}</li>}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleModalClose}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button 
              type="submit"
              disabled={
                !isValid || 
                createMutation.isPending || 
                updateMutation.isPending || 
                categoriesLoading || 
                activeCategories.length === 0
              }
            >
              {editingSubCategory ? 
                (t('common.update') || 'Update') : 
                (t('common.create') || 'Create')
              }
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

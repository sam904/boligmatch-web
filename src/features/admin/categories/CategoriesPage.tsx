// src/features/admin/categories/CategoriesPage.tsx
import { useState, useEffect } from 'react';
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

// Enhanced validation schema with required imageUrl
const categorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  imageUrl: z.string()
    .min(1, "Image URL is required")
    .url("Please enter a valid URL for the image"),
  iconUrl: z.string()
    .min(1, "Icon URL is required")
    .url("Please enter a valid URL for the icon"),
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
  const [previewImage, setPreviewImage] = useState<{ url: string; isOpen: boolean }>({
    url: '',
    isOpen: false
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

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
      imageUrl: '',
      iconUrl: '',
    },
  });

  // Watch the form values
  const imageUrlValue = watch('imageUrl');
  const iconUrlValue = watch('iconUrl');
  const nameValue = watch('name');

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        imageUrl: editingCategory.imageUrl || '',
        iconUrl: editingCategory.iconUrl || '',
        isActive: editingCategory.isActive,
      });
    } else {
      reset({
        name: '',
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

  const handleDeleteCategory = (category: Category) => {
    if (!category.id) return;
    
    const confirmMessage = t('admin.categories.deleteConfirm') || "Are you sure you want to delete this category?";
    
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    clearErrors();
  };

  const categories = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

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
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title={t('common.edit') || "Edit category"}
            onClick={() => {
              setEditingCategory(row.original);
              setIsModalOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrash}
            title={t('common.delete') || "Delete category"}
            onClick={() => handleDeleteCategory(row.original)}
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
            <h1 className="text-xl font-bold text-gray-900">{t('admin.categories.title') || "Categories"}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.categories.subtitle') || "Manage your categories"}</p>
          </div>

          {/* Right side: SearchBar and Add Category button */}
          <div className="flex items-center gap-4">
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
          <DataTable data={categories} columns={columns} />
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
          
          {/* Image Upload for Category Image - Now Required */}
          <ImageUpload
            label={`${t('admin.categories.imageUrl') || "Image URL"} *`}
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
            label={`${t('admin.categories.iconUrl') || "Icon URL"} *`}
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
















// // src/features/admin/categories/CategoriesPage.tsx
// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { categoryService } from '../../../services/category.service';
// import DataTable from '../../../components/common/DataTable/DataTable';
// import Pagination from '../../../components/common/Pagination';
// import SearchBar from '../../../components/common/SearchBar';
// import Modal from '../../../components/common/Modal';
// import Button from '../../../components/common/Button';
// import Input from '../../../components/common/Input';
// import ImageUpload from '../../../components/common/ImageUpload';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { useTranslation } from 'react-i18next';
// import { useDbTranslation } from '../../../hooks/useDbTranslation';
// import { useDebounce } from '../../../hooks/useDebounce';
// import type { ColumnDef } from '@tanstack/react-table';
// import type { Category } from '../../../types/category';

// const categorySchema = z.object({
//   name: z.string().min(1),
//   imageUrl: z.string().optional(),
//   iconUrl: z.string().optional(),
//   isActive: z.boolean(),
// });

// type CategoryFormData = z.infer<typeof categorySchema>;

// export default function CategoriesPage() {
//   const { t } = useTranslation();
//   const { translateCategory } = useDbTranslation();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize,setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);
//   const queryClient = useQueryClient();

//   const { data: paginatedData, isLoading } = useQuery({
//     queryKey: ['categories', currentPage, pageSize, debouncedSearchTerm],
//     queryFn: () => categoryService.getPaginated({
//       page: currentPage,
//       pageSize,
//       searchTerm: debouncedSearchTerm || undefined,
//     }),
//   });

//   const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CategoryFormData>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: {
//       isActive: true,
//       imageUrl: '',
//       iconUrl: '',
//     },
//   });

//   // Watch the imageUrl and iconUrl values
//   const imageUrlValue = watch('imageUrl');
//   const iconUrlValue = watch('iconUrl');

//   useEffect(() => {
//     if (editingCategory) {
//       reset({
//         name: editingCategory.name,
//         imageUrl: editingCategory.imageUrl || '',
//         iconUrl: editingCategory.iconUrl || '',
//         isActive: editingCategory.isActive,
//       });
//     } else {
//       reset({
//         name: '',
//         imageUrl: '',
//         iconUrl: '',
//         isActive: true,
//       });
//     }
//   }, [editingCategory, reset]);

//   const createMutation = useMutation({
//     mutationFn: categoryService.add,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
//       toast.success(t('admin.categories.createSuccess'));
//       setIsModalOpen(false);
//       reset();
//     },
//     onError: () => toast.error(t('admin.categories.createError')),
//   });

//   const updateMutation = useMutation({
//     mutationFn: categoryService.update,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
//       toast.success(t('admin.categories.updateSuccess'));
//       setIsModalOpen(false);
//       setEditingCategory(null);
//       reset();
//     },
//     onError: () => toast.error(t('admin.categories.updateError')),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: categoryService.remove,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
//       toast.success(t('admin.categories.deleteSuccess'));
//     },
//     onError: () => toast.error(t('admin.categories.deleteError')),
//   });

//   const onSubmit = (data: CategoryFormData) => {
//     if (editingCategory) {
//       updateMutation.mutate({ ...data, id: editingCategory.id });
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   const handlePageSizeChange = (size: number) => {
//     setPageSize(size);
//     setCurrentPage(1);
//   };


//   const handleSearchChange = (term: string) => {
//     setSearchTerm(term);
//     setCurrentPage(1);
//   };

//   const categories = paginatedData?.items || [];
//   const totalItems = paginatedData?.total || 0;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

//   const columns: ColumnDef<Category>[] = [
//     { accessorKey: 'id', header: t('admin.categories.id') },
//     { 
//       accessorKey: 'name', 
//       header: t('admin.categories.name'),
//       cell: ({ row }) => translateCategory(row.original.name)
//     },
//     {
//       accessorKey: 'imageUrl',
//       header: t('admin.categories.image'),
//       cell: ({ row }) => row.original.imageUrl ? (
//         <img src={row.original.imageUrl} alt={translateCategory(row.original.name)} className="w-10 h-10 object-cover rounded" />
//       ) : '-',
//     },
//     {
//       accessorKey: 'isActive',
//       header: t('common.status'),
//       cell: ({ row }) => (
//         <span 
//           className="px-2 py-0.5 rounded text-xs text-white font-medium"
//           style={{ 
//             backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
//           }}
//         >
//           {row.original.isActive ? t('common.active') : t('common.inactive')}
//         </span>
//       ),
//     },
//     {
//       id: 'actions',
//       header: t('common.actions'),
//       cell: ({ row }) => (
//         <div className="flex gap-2">
//           <Button variant="secondary" onClick={() => {
//             setEditingCategory(row.original);
//             setIsModalOpen(true);
//           }}>{t('common.edit')}</Button>
//           <Button variant="danger" onClick={() => {
//             if (window.confirm(t('admin.categories.deleteConfirm'))) {
//               deleteMutation.mutate(row.original.id);
//             }
//           }}>{t('common.delete')}</Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-3">
//       <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
//   <div className="flex justify-between items-center">
//     {/* Left side: Title */}
//     <div>
//       <h1 className="text-xl font-bold text-gray-900">{t('admin.categories.title')}</h1>
//       <p className="text-gray-600 text-sm mt-1">{t('admin.categories.subtitle')}</p>
//     </div>

//     {/* Right side: SearchBar and Add Category button */}
//     <div className="flex items-center gap-4">
//       <div className="w-64">
//         <SearchBar
//           searchTerm={searchTerm}
//           onSearchChange={handleSearchChange}
//         />
//       </div>
//       <Button
//         variant="primary"
//         size="md"
//         onClick={() => {
//           setEditingCategory(null);
//           setIsModalOpen(true);
//         }}
//       >
//         {t('admin.categories.addCategory')}
//       </Button>
//     </div>
//   </div>
// </div>

//       {isLoading ? (
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
//           <p className="mt-3 text-sm text-gray-600">{t('common.loading')}</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           {/* <div className="p-4 border-b border-gray-200">
//             <SearchBar
//               searchTerm={searchTerm}
//               onSearchChange={handleSearchChange}
//             />
//           </div> */}
//           <DataTable data={categories} columns={columns} />
//           <div className="px-4 pb-4">
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               totalItems={totalItems}
//               pageSize={pageSize}
//               onPageChange={handlePageChange}
//               onPageSizeChange={handlePageSizeChange}
//             />
//           </div>
//         </div>
//       )}

//       <Modal
//         open={isModalOpen}
//         title={editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addCategory')}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingCategory(null);
//         }}
//       >
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <Input 
//             label={t('admin.categories.name')} 
//             error={errors.name?.message} 
//             {...register('name')} 
//           />
          
//           {/* Image Upload for Category Image */}
//           <ImageUpload
//             label={t('admin.categories.imageUrl')}
//             value={imageUrlValue}
//             onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
//             folder="categories/images"
//             error={errors.imageUrl?.message}
//           />

//           {/* Image Upload for Category Icon */}
//           <ImageUpload
//             label={t('admin.categories.iconUrl')}
//             value={iconUrlValue}
//             onChange={(url) => setValue('iconUrl', url, { shouldValidate: true })}
//             folder="categories/icons"
//             error={errors.iconUrl?.message}
//           />

//           <div className="flex items-center gap-2">
//             <input type="checkbox" id="isActive" {...register('isActive')} />
//             <label htmlFor="isActive">{t('common.active')}</label>
//           </div>
          
//           <div className="flex gap-2 justify-end">
//             <Button type="button" variant="secondary" onClick={() => {
//               setIsModalOpen(false);
//               setEditingCategory(null);
//             }}>{t('common.cancel')}</Button>
//             <Button type="submit">{editingCategory ? t('common.update') : t('common.create')}</Button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }
// src/features/admin/subcategories/SubCategoriesPage.tsx
import { useState, useEffect } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDbTranslation } from '../../../hooks/useDbTranslation';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ColumnDef } from '@tanstack/react-table';
import type { SubCategory } from '../../../types/subcategory';
//import type { Category } from '../../../types/category';

// Enhanced validation schema
const subCategorySchema = z.object({
  categoryId: z.number().min(1, 'Category is required'),
  name: z.string()
    .min(1, 'Subcategory name is required')
    .max(100, 'Subcategory name must be less than 100 characters'),
  imageUrl: z.string()
    .min(1, 'Image URL is required')
    .url('Please enter a valid URL for the image'),
  iconUrl: z.string()
    .min(1, 'Icon URL is required')
    .url('Please enter a valid URL for the icon'),
  isActive: z.boolean(),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

export default function SubCategoriesPage() {
  const { t } = useTranslation();
  const { translateCategory, translateSubCategory } = useDbTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Fetch subcategories
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['subcategories', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => subCategoryService.getPaginated({
      page: currentPage,
      pageSize,
      searchTerm: debouncedSearchTerm || undefined,
    }),
  });

  // Fetch categories - fixed query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getAll(true), // includeInActive = true
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors, isValid }, 
    reset,
    watch,
    trigger
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
      // Set default category when categories are loaded
      if (categories.length > 0) {
        reset({
          categoryId: categories[0]?.id || 0,
          name: '',
          imageUrl: '',
          iconUrl: '',
          isActive: true,
        });
      }
    }
  }, [editingSubCategory, categories, reset]);

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
  };

  const subCategories = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Prepare category options for dropdown
  const categoryOptions = categories.map(category => ({
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
      id: 'actions',
      header: t('common.actions') || 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => {
              setEditingSubCategory(row.original);
              setIsModalOpen(true);
            }}
          >
            {t('common.edit') || 'Edit'}
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDeleteSubCategory(row.original)}
          >
            {t('common.delete') || 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('admin.subcategories.title') || 'Subcategories'}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.subcategories.subtitle') || 'Manage your subcategories'}</p>
          </div>

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
                setEditingSubCategory(null);
                setIsModalOpen(true);
              }}
              disabled={categoriesLoading}
            >
              {t('admin.subcategories.addSubCategory') || 'Add Subcategory'}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4 text-gray-600">{t('common.loading') || 'Loading...'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <DataTable data={subCategories} columns={columns} />
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

      {/* Fixed Modal - removed size prop */}
      <Modal
        open={isModalOpen}
        title={editingSubCategory ? 
          (t('admin.subcategories.editSubCategory') || 'Edit Subcategory') : 
          (t('admin.subcategories.addSubCategory') || 'Add Subcategory')
        }
        onClose={handleModalClose}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Dropdown - removed required prop */}
          <SearchableSelectController
            name="categoryId"
            control={control}
            label={t('admin.subcategories.category') || 'Category'}
            error={errors.categoryId?.message}
            options={categoryOptions}
            placeholder={categoriesLoading ? "Loading categories..." : "Select Category"}
            disabled={categoriesLoading}
          />

          {/* Subcategory Name */}
          <Input 
            label={t('admin.subcategories.name') || 'Subcategory Name'} 
            error={errors.name?.message}
            {...register('name')}
            required
            maxLength={100}
            placeholder="Enter subcategory name"
          />
          
          {/* Character count */}
          <div className="text-xs text-gray-500 -mt-2">
            {nameValue?.length || 0}/100 characters
          </div>

          {/* Image URL */}
          <Input 
            label={`${t('admin.subcategories.imageUrl') || 'Image URL'} *`}
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
            required
            placeholder="Enter image URL"
          />

          {/* Icon URL */}
          <Input 
            label={`${t('admin.subcategories.iconUrl') || 'Icon URL'} *`}
            error={errors.iconUrl?.message}
            {...register('iconUrl')}
            required
            placeholder="Enter icon URL"
          />

          {/* Active Status */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <input 
              type="checkbox" 
              id="isActive" 
              {...register('isActive')} 
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleModalClose}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button 
              type="submit"
              disabled={!isValid || createMutation.isPending || updateMutation.isPending || categoriesLoading}
            >
              {editingSubCategory ? 
                (t('common.update') || 'Update') : 
                (t('common.create') || 'Create')
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}













// // src/features/admin/subcategories/SubCategoriesPage.tsx
// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { subCategoryService } from '../../../services/subCategory.service';
// import { categoryService } from '../../../services/category.service';
// import DataTable from '../../../components/common/DataTable/DataTable';
// import Pagination from '../../../components/common/Pagination';
// import SearchBar from '../../../components/common/SearchBar';
// import Modal from '../../../components/common/Modal';
// import Button from '../../../components/common/Button';
// import Input from '../../../components/common/Input';
// import SearchableSelectController from '../../../components/common/SearchableSelectController';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { useTranslation } from 'react-i18next';
// import { useDbTranslation } from '../../../hooks/useDbTranslation';
// import { useDebounce } from '../../../hooks/useDebounce';
// import type { ColumnDef } from '@tanstack/react-table';
// import type { SubCategory } from '../../../types/subcategory';

// const subCategorySchema = z.object({
//   categoryId: z.number().min(1, 'Category is required'),
//   name: z.string().min(1, 'Name is required'),
//   imageUrl: z.string().optional(),
//   iconUrl: z.string().optional(),
//   isActive: z.boolean(),
// });

// type SubCategoryFormData = z.infer<typeof subCategorySchema>;

// export default function SubCategoriesPage() {
//   const { t } = useTranslation();
//   const { translateCategory, translateSubCategory } = useDbTranslation();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);
//   const queryClient = useQueryClient();

//   const { data: paginatedData, isLoading } = useQuery({
//     queryKey: ['subcategories', currentPage, pageSize, debouncedSearchTerm],
//     queryFn: () => subCategoryService.getPaginated({
//       page: currentPage,
//       pageSize,
//       searchTerm: debouncedSearchTerm || undefined,
//     }),
//   });

//   const { data: categories = [] } = useQuery({
//     queryKey: ['categories-all'],
//     queryFn: () => categoryService.getAll(true),
//   });

//   const { register, handleSubmit, control, formState: { errors }, reset } = useForm<SubCategoryFormData>({
//     resolver: zodResolver(subCategorySchema),
//     defaultValues: {
//       isActive: true,
//     },
//   });

//   useEffect(() => {
//     if (editingSubCategory) {
//       reset({
//         categoryId: editingSubCategory.categoryId,
//         name: editingSubCategory.name,
//         imageUrl: editingSubCategory.imageUrl || '',
//         iconUrl: editingSubCategory.iconUrl || '',
//         isActive: editingSubCategory.isActive,
//       });
//     } else {
//       reset({
//         categoryId: categories[0]?.id || 0,
//         name: '',
//         imageUrl: '',
//         iconUrl: '',
//         isActive: true,
//       });
//     }
//   }, [editingSubCategory, categories, reset]);

//   const createMutation = useMutation({
//     mutationFn: subCategoryService.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
//       toast.success(t('admin.subcategories.createSuccess'));
//       setIsModalOpen(false);
//       reset();
//     },
//     onError: () => toast.error(t('admin.subcategories.createError')),
//   });

//   const updateMutation = useMutation({
//     mutationFn: subCategoryService.update,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
//       toast.success(t('admin.subcategories.updateSuccess'));
//       setIsModalOpen(false);
//       setEditingSubCategory(null);
//       reset();
//     },
//     onError: () => toast.error(t('admin.subcategories.updateError')),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: subCategoryService.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
//       toast.success(t('admin.subcategories.deleteSuccess'));
//     },
//     onError: () => toast.error(t('admin.subcategories.deleteError')),
//   });

//   const onSubmit = (data: SubCategoryFormData) => {
//     if (editingSubCategory) {
//       updateMutation.mutate({ ...data, id: editingSubCategory.id });
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

//   const subCategories = paginatedData?.data || [];
//   const totalItems = paginatedData?.total || 0;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

//   const columns: ColumnDef<SubCategory>[] = [
//     { accessorKey: 'id', header: t('admin.subcategories.id') },
//     { 
//       accessorKey: 'name', 
//       header: t('admin.subcategories.name'),
//       cell: ({ row }) => translateSubCategory(row.original.name)
//     },
//     {
//       accessorKey: 'categoryName',
//       header: t('admin.subcategories.category'),
//       cell: ({ row }) => {
//         const category = categories.find(c => c.id === row.original.categoryId);
//         return category ? translateCategory(category.name) : '-';
//       },
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
//             setEditingSubCategory(row.original);
//             setIsModalOpen(true);
//           }}>{t('common.edit')}</Button>
//           <Button variant="danger" onClick={() => {
//             if (window.confirm(t('admin.subcategories.deleteConfirm'))) {
//               deleteMutation.mutate(row.original.id);
//             }
//           }}>{t('common.delete')}</Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-3">
//      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
//   <div className="flex justify-between items-center">
//     {/* Left side: Title */}
//     <div>
//       <h1 className="text-xl font-bold text-gray-900">{t('admin.subcategories.title')}</h1>
//       <p className="text-gray-600 text-sm mt-1">{t('admin.subcategories.subtitle')}</p>
//     </div>

//     {/* Right side: SearchBar and Add SubCategory button */}
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
//           setEditingSubCategory(null);
//           setIsModalOpen(true);
//         }}
//       >
//         {t('admin.subcategories.addSubCategory')}
//       </Button>
//     </div>
//   </div>
// </div>

//       {isLoading ? (
//         <div className="bg-white rounded-lg shadow-lg p-8 text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
//           <p className="mt-4 text-gray-600">{t('common.loading')}</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <DataTable data={subCategories} columns={columns} />
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
//         title={editingSubCategory ? t('admin.subcategories.editSubCategory') : t('admin.subcategories.addSubCategory')}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingSubCategory(null);
//         }}
//       >
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <SearchableSelectController
//             name="categoryId"
//             control={control}
//             label={t('admin.subcategories.category')}
//             error={errors.categoryId?.message}
//             options={categories.map(cat => ({
//               value: cat.id,
//               label: translateCategory(cat.name)
//             }))}
//             placeholder="Select Category"
//           />
//           <Input label={t('admin.subcategories.name')} error={errors.name?.message} {...register('name')} />
//           <Input label={t('admin.subcategories.imageUrl')} error={errors.imageUrl?.message} {...register('imageUrl')} />
//           <Input label={t('admin.subcategories.iconUrl')} error={errors.iconUrl?.message} {...register('iconUrl')} />
//           <div className="flex items-center gap-2">
//             <input type="checkbox" id="isActive" {...register('isActive')} />
//             <label htmlFor="isActive">{t('common.active')}</label>
//           </div>
//           <div className="flex gap-2 justify-end">
//             <Button type="button" variant="secondary" onClick={() => {
//               setIsModalOpen(false);
//               setEditingSubCategory(null);
//             }}>{t('common.cancel')}</Button>
//             <Button type="submit">{editingSubCategory ? t('common.update') : t('common.create')}</Button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }

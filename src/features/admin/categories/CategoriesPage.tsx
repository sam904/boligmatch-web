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

const categorySchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  iconUrl: z.string().optional(),
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

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
      imageUrl: '',
      iconUrl: '',
    },
  });

  // Watch the imageUrl and iconUrl values
  const imageUrlValue = watch('imageUrl');
  const iconUrlValue = watch('iconUrl');

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
      toast.success(t('admin.categories.createSuccess'));
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error(t('admin.categories.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success(t('admin.categories.updateSuccess'));
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: () => toast.error(t('admin.categories.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success(t('admin.categories.deleteSuccess'));
    },
    onError: () => toast.error(t('admin.categories.deleteError')),
  });

  const onSubmit = (data: CategoryFormData) => {
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

  const categories = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'id', header: t('admin.categories.id') },
    { 
      accessorKey: 'name', 
      header: t('admin.categories.name'),
      cell: ({ row }) => translateCategory(row.original.name)
    },
    {
      accessorKey: 'imageUrl',
      header: t('admin.categories.image'),
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
      header: t('admin.categories.icon'),
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
      header: t('common.status'),
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ 
            backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
          }}
        >
          {row.original.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    // {
    //   id: 'actions',
    //   header: t('common.actions'),
    //   cell: ({ row }) => (
    //     <div className="flex gap-2">
    //       <Button variant="secondary" onClick={() => {
    //         setEditingCategory(row.original);
    //         setIsModalOpen(true);
    //       }}>{t('common.edit')}</Button>
    //       <Button variant="danger" onClick={() => {
    //         if (window.confirm(t('admin.categories.deleteConfirm'))) {
    //           deleteMutation.mutate(row.original.id);
    //         }
    //       }}>{t('common.delete')}</Button>
    //     </div>
    //   ),
    // },

    {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={FaEdit}
                title="Edit user" // Accessibility improvement
                onClick={() => {
                  setEditingCategory(row.original);
                  setIsModalOpen(true);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={FaTrash}
                title="Delete user" // Accessibility improvement
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this user?")
                  ) {
                    deleteMutation.mutate(row.original.id);
                  }
                }}
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
            <h1 className="text-xl font-bold text-gray-900">{t('admin.categories.title')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.categories.subtitle')}</p>
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
              {t('admin.categories.addCategory')}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-3 text-sm text-gray-600">{t('common.loading')}</p>
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
        title={editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addCategory')}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label={t('admin.categories.name')} 
            error={errors.name?.message} 
            {...register('name')} 
          />
          
          {/* Image Upload for Category Image */}
          <ImageUpload
            label={t('admin.categories.imageUrl')}
            value={imageUrlValue}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
            folder="categories/images"
            error={errors.imageUrl?.message}
          />

          {/* Image Upload for Category Icon */}
          <ImageUpload
            label={t('admin.categories.iconUrl')}
            value={iconUrlValue}
            onChange={(url) => setValue('iconUrl', url, { shouldValidate: true })}
            folder="categories/icons"
            error={errors.iconUrl?.message}
          />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">{t('common.active')}</label>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingCategory(null);
            }}>{t('common.cancel')}</Button>
            <Button type="submit">{editingCategory ? t('common.update') : t('common.create')}</Button>
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
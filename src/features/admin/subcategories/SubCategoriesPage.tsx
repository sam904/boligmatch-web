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

const subCategorySchema = z.object({
  categoryId: z.number().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().optional(),
  iconUrl: z.string().optional(),
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

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['subcategories', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => subCategoryService.getPaginated({
      page: currentPage,
      pageSize,
      searchTerm: debouncedSearchTerm || undefined,
    }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getAll(true),
  });

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      isActive: true,
    },
  });

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
      reset({
        categoryId: categories[0]?.id || 0,
        name: '',
        imageUrl: '',
        iconUrl: '',
        isActive: true,
      });
    }
  }, [editingSubCategory, categories, reset]);

  const createMutation = useMutation({
    mutationFn: subCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.createSuccess'));
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error(t('admin.subcategories.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: subCategoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.updateSuccess'));
      setIsModalOpen(false);
      setEditingSubCategory(null);
      reset();
    },
    onError: () => toast.error(t('admin.subcategories.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: subCategoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'], exact: false });
      toast.success(t('admin.subcategories.deleteSuccess'));
    },
    onError: () => toast.error(t('admin.subcategories.deleteError')),
  });

  const onSubmit = (data: SubCategoryFormData) => {
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

  const subCategories = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const columns: ColumnDef<SubCategory>[] = [
    { accessorKey: 'id', header: t('admin.subcategories.id') },
    { 
      accessorKey: 'name', 
      header: t('admin.subcategories.name'),
      cell: ({ row }) => translateSubCategory(row.original.name)
    },
    {
      accessorKey: 'categoryName',
      header: t('admin.subcategories.category'),
      cell: ({ row }) => {
        const category = categories.find(c => c.id === row.original.categoryId);
        return category ? translateCategory(category.name) : '-';
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
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setEditingSubCategory(row.original);
            setIsModalOpen(true);
          }}>{t('common.edit')}</Button>
          <Button variant="danger" onClick={() => {
            if (window.confirm(t('admin.subcategories.deleteConfirm'))) {
              deleteMutation.mutate(row.original.id);
            }
          }}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('admin.subcategories.title')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.subcategories.subtitle')}</p>
          </div>
          <button
            onClick={() => {
              setEditingSubCategory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.subcategories.addSubCategory')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
          <DataTable data={subCategories} columns={columns} />
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

      <Modal
        open={isModalOpen}
        title={editingSubCategory ? t('admin.subcategories.editSubCategory') : t('admin.subcategories.addSubCategory')}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubCategory(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SearchableSelectController
            name="categoryId"
            control={control}
            label={t('admin.subcategories.category')}
            error={errors.categoryId?.message}
            options={categories.map(cat => ({
              value: cat.id,
              label: translateCategory(cat.name)
            }))}
            placeholder="Select Category"
          />
          <Input label={t('admin.subcategories.name')} error={errors.name?.message} {...register('name')} />
          <Input label={t('admin.subcategories.imageUrl')} error={errors.imageUrl?.message} {...register('imageUrl')} />
          <Input label={t('admin.subcategories.iconUrl')} error={errors.iconUrl?.message} {...register('iconUrl')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">{t('common.active')}</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingSubCategory(null);
            }}>{t('common.cancel')}</Button>
            <Button type="submit">{editingSubCategory ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

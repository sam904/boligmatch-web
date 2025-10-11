// src/features/admin/categories/CategoriesPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../../services/category.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDbTranslation } from '../../../hooks/useDbTranslation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Category } from '../../../types/category';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().optional(),
  iconUrl: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { translateCategory } = useDbTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(true),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin.categories.createSuccess'));
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error(t('admin.categories.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('admin.categories.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

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
      cell: ({ row }) => row.original.imageUrl ? (
        <img src={row.original.imageUrl} alt={translateCategory(row.original.name)} className="w-12 h-12 object-cover rounded" />
      ) : '-',
    },
    {
      accessorKey: 'isActive',
      header: t('common.status'),
      cell: ({ row }) => (
        <span 
          className="px-2 py-1 rounded text-sm text-white font-medium"
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
          <Button variant="secondary" onClick={() => handleEdit(row.original)}>{t('common.edit')}</Button>
          <Button variant="danger" onClick={() => handleDelete(row.original.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.categories.title')}</h1>
            <p className="text-gray-600">Manage and organize your categories</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.categories.addCategory')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <DataTable data={categories} columns={columns} />
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addCategory')}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={t('admin.categories.name')} error={errors.name?.message} {...register('name')} />
          <Input label={t('admin.categories.imageUrl')} error={errors.imageUrl?.message} {...register('imageUrl')} />
          <Input label={t('admin.categories.iconUrl')} error={errors.iconUrl?.message} {...register('iconUrl')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">{t('common.active')}</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingCategory(null);
            }}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingCategory ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

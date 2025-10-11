// src/features/admin/subcategories/SubCategoriesPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subCategoryService } from '../../../services/subCategory.service';
import { categoryService } from '../../../services/category.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const queryClient = useQueryClient();

  const { data: subCategories = [], isLoading } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => subCategoryService.getAll(true),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(true),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubCategoryFormData>({
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
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('SubCategory created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create subcategory'),
  });

  const updateMutation = useMutation({
    mutationFn: subCategoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('SubCategory updated successfully');
      setIsModalOpen(false);
      setEditingSubCategory(null);
      reset();
    },
    onError: () => toast.error('Failed to update subcategory'),
  });

  const deleteMutation = useMutation({
    mutationFn: subCategoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast.success('SubCategory deleted successfully');
    },
    onError: () => toast.error('Failed to delete subcategory'),
  });

  const onSubmit = (data: SubCategoryFormData) => {
    if (editingSubCategory) {
      updateMutation.mutate({ ...data, id: editingSubCategory.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: ColumnDef<SubCategory>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => categories.find(c => c.id === row.original.categoryId)?.name || '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-sm ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setEditingSubCategory(row.original);
            setIsModalOpen(true);
          }}>Edit</Button>
          <Button variant="danger" onClick={() => {
            if (window.confirm('Delete this subcategory?')) {
              deleteMutation.mutate(row.original.id);
            }
          }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sub Categories</h1>
        <Button onClick={() => {
          setEditingSubCategory(null);
          setIsModalOpen(true);
        }}>Add SubCategory</Button>
      </div>

      {isLoading ? <div>Loading...</div> : <DataTable data={subCategories} columns={columns} />}

      <Modal
        open={isModalOpen}
        title={editingSubCategory ? 'Edit SubCategory' : 'Add SubCategory'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubCategory(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category"
            error={errors.categoryId?.message}
            {...register('categoryId', { valueAsNumber: true })}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Image URL" error={errors.imageUrl?.message} {...register('imageUrl')} />
          <Input label="Icon URL" error={errors.iconUrl?.message} {...register('iconUrl')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">Active</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingSubCategory(null);
            }}>Cancel</Button>
            <Button type="submit">{editingSubCategory ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

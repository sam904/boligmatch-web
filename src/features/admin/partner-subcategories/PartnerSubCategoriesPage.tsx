// src/features/admin/partner-subcategories/PartnerSubCategoriesPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerSubCategoryService } from '../../../services/partnerSubCategory.service';
import { partnerService } from '../../../services/partner.service';
import { subCategoryService } from '../../../services/subCategory.service';
import { categoryService } from '../../../services/category.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import SearchBar from '../../../components/common/SearchBar';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { PartnerSubCategory } from '../../../types/partner';

const partnerSubCategorySchema = z.object({
  partnerId: z.number().min(1, 'Partner is required'),
  subCategoryId: z.number().min(1, 'SubCategory is required'),
  isActive: z.boolean(),
});

type PartnerSubCategoryFormData = z.infer<typeof partnerSubCategorySchema>;

export default function PartnerSubCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerSubCategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['partner-subcategories'],
    queryFn: () => partnerSubCategoryService.getAll(true),
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnerService.getAll(true),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(true),
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: () => selectedCategoryId ? subCategoryService.getByCategoryId(selectedCategoryId, true) : Promise.resolve([]),
    enabled: selectedCategoryId > 0,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PartnerSubCategoryFormData>({
    resolver: zodResolver(partnerSubCategorySchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        partnerId: editingItem.partnerId,
        subCategoryId: editingItem.subCategoryId,
        isActive: editingItem.isActive,
      });
      if (editingItem.categoryId) {
        setSelectedCategoryId(editingItem.categoryId);
      }
    } else {
      reset({
        partnerId: partners[0]?.id || 0,
        subCategoryId: 0,
        isActive: true,
      });
    }
  }, [editingItem, partners, reset]);

  const createMutation = useMutation({
    mutationFn: partnerSubCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-subcategories'] });
      toast.success('Partner SubCategory created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create partner subcategory'),
  });

  const updateMutation = useMutation({
    mutationFn: partnerSubCategoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-subcategories'] });
      toast.success('Partner SubCategory updated successfully');
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
    },
    onError: () => toast.error('Failed to update partner subcategory'),
  });

  const deleteMutation = useMutation({
    mutationFn: partnerSubCategoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-subcategories'] });
      toast.success('Partner SubCategory deleted successfully');
    },
    onError: () => toast.error('Failed to delete partner subcategory'),
  });

  const onSubmit = (data: PartnerSubCategoryFormData) => {
    if (editingItem) {
      updateMutation.mutate({ ...data, id: editingItem.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => {
      const partner = partners.find(p => p.id === item.partnerId);
      const category = categories.find(c => c.id === item.categoryId);
      return (
        partner?.name?.toLowerCase().includes(lowerSearch) ||
        category?.name?.toLowerCase().includes(lowerSearch) ||
        item.subCategoryName?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [items, searchTerm, partners, categories]);

  const columns: ColumnDef<PartnerSubCategory>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'partnerName',
      header: 'Partner',
      cell: ({ row }) => partners.find(p => p.id === row.original.partnerId)?.name || '-',
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => categories.find(c => c.id === row.original.categoryId)?.name || '-',
    },
    {
      accessorKey: 'subCategoryName',
      header: 'SubCategory',
      cell: ({ row }) => row.original.subCategoryName || '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span 
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ 
            backgroundColor: row.original.isActive ? 'var(--color-secondary)' : 'var(--color-neutral)'
          }}
        >
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
            setEditingItem(row.original);
            setIsModalOpen(true);
          }}>Edit</Button>
          <Button variant="danger" onClick={() => {
            if (window.confirm('Delete this relationship?')) {
              deleteMutation.mutate(row.original.id);
            }
          }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Partner SubCategories</h1>
            <p className="text-gray-600 text-sm mt-1">Manage partner subcategory mappings</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setSelectedCategoryId(0);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Mapping
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
          <DataTable data={filteredItems} columns={columns} />
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingItem ? 'Edit Partner SubCategory' : 'Add Partner SubCategory'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setSelectedCategoryId(0);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Partner"
            error={errors.partnerId?.message}
            {...register('partnerId', { valueAsNumber: true })}
          >
            {partners.map(partner => (
              <option key={partner.id} value={partner.id}>{partner.name}</option>
            ))}
          </Select>
          
          <Select
            label="Category"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(Number(e.target.value));
              setValue('subCategoryId', 0);
            }}
          >
            <option value={0}>Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>

          <Select
            label="SubCategory"
            error={errors.subCategoryId?.message}
            {...register('subCategoryId', { valueAsNumber: true })}
            disabled={!selectedCategoryId}
          >
            <option value={0}>Select SubCategory</option>
            {subCategories.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </Select>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">Active</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingItem(null);
              setSelectedCategoryId(0);
            }}>Cancel</Button>
            <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

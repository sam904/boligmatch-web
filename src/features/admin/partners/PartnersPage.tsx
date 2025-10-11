// src/features/admin/partners/PartnersPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../services/partner.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import SearchBar from '../../../components/common/SearchBar';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { Partner } from '../../../types/partner';

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export default function PartnersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnerService.getAll(true),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingPartner) {
      reset({
        name: editingPartner.name,
        email: editingPartner.email || '',
        phone: editingPartner.phone || '',
        address: editingPartner.address || '',
        city: editingPartner.city || '',
        zipCode: editingPartner.zipCode || '',
        imageUrl: editingPartner.imageUrl || '',
        isActive: editingPartner.isActive,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        imageUrl: '',
        isActive: true,
      });
    }
  }, [editingPartner, reset]);

  const createMutation = useMutation({
    mutationFn: partnerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partner created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create partner'),
  });

  const updateMutation = useMutation({
    mutationFn: partnerService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partner updated successfully');
      setIsModalOpen(false);
      setEditingPartner(null);
      reset();
    },
    onError: () => toast.error('Failed to update partner'),
  });

  const deleteMutation = useMutation({
    mutationFn: partnerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partner deleted successfully');
    },
    onError: () => toast.error('Failed to delete partner'),
  });

  const onSubmit = (data: PartnerFormData) => {
    if (editingPartner) {
      updateMutation.mutate({ ...data, id: editingPartner.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPartners = useMemo(() => {
    if (!searchTerm) return partners;
    const lowerSearch = searchTerm.toLowerCase();
    return partners.filter(partner => 
      partner.name?.toLowerCase().includes(lowerSearch) ||
      partner.email?.toLowerCase().includes(lowerSearch) ||
      partner.city?.toLowerCase().includes(lowerSearch)
    );
  }, [partners, searchTerm]);

  const columns: ColumnDef<Partner>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'city', header: 'City' },
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
            setEditingPartner(row.original);
            setIsModalOpen(true);
          }}>Edit</Button>
          <Button variant="danger" onClick={() => {
            if (window.confirm('Delete this partner?')) {
              deleteMutation.mutate(row.original.id);
            }
          }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Partners</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your partners</p>
          </div>
          <button
            onClick={() => {
              setEditingPartner(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
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
          <DataTable data={filteredPartners} columns={columns} />
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingPartner ? 'Edit Partner' : 'Add Partner'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPartner(null);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="Zip Code" error={errors.zipCode?.message} {...register('zipCode')} />
          </div>
          <Input label="Image URL" error={errors.imageUrl?.message} {...register('imageUrl')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive">Active</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingPartner(null);
            }}>Cancel</Button>
            <Button type="submit">{editingPartner ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

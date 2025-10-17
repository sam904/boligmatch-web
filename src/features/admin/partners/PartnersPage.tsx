// src/features/admin/partners/PartnersPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../services/partner.service';
import { subCategoryService } from '../../../services/subCategory.service';
import DataTable from '../../../components/common/DataTable/DataTable';
import Pagination from '../../../components/common/Pagination';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Stepper from '../../../components/common/Stepper';
import TextArea from '../../../components/common/TextArea';
import Select from '../../../components/common/Select';
import ImageUpload from '../../../components/common/ImageUpload';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ColumnDef } from '@tanstack/react-table';
import type { Partner } from '../../../types/partner';
import { categoryService } from '../../../services/category.service';

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

// Fix the schema - explicitly set isActive as boolean
const partnerSubCategorySchema = z.object({
  id: z.number().optional(),
  patnerId: z.number().optional(),
  subCategoryId: z.number().min(1, 'Sub Category is required'),
  isActive: z.boolean(),
});

const partnerSchema = z.object({
  userId: z.number().min(1, 'User ID is required'),
  address: z.string().min(1, 'Address is required'),
  businessUnit: z.number().min(1, 'Business Unit is required'),
  videoUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  cvr: z.number().min(0, 'CVR is required'),
  descriptionShort: z.string().optional(),
  textField1: z.string().optional(),
  textField2: z.string().optional(),
  textField3: z.string().optional(),
  textField4: z.string().optional(),
  textField5: z.string().optional(),
  imageUrl1: z.string().optional(),
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  imageUrl4: z.string().optional(),
  imageUrl5: z.string().optional(),
  isActive: z.boolean(),
  parSubCatlst: z.array(partnerSubCategorySchema).min(1, 'At least one sub category is required'),
});

// Create a manual type that matches the schema exactly
type PartnerFormData = {
  userId: number;
  address: string;
  businessUnit: number;
  videoUrl?: string;
  logoUrl?: string;
  cvr: number;
  descriptionShort?: string;
  textField1?: string;
  textField2?: string;
  textField3?: string;
  textField4?: string;
  textField5?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  imageUrl5?: string;
  isActive: boolean;
  parSubCatlst: Array<{
    id?: number;
    patnerId?: number;
    subCategoryId: number;
    isActive: boolean;
  }>;
};

// Extended Partner type to include parSubCatlst
interface PartnerWithSubCategories extends Partner {
  parSubCatlst?: Array<{
    id?: number;
    patnerId?: number;
    subCategoryId: number;
    isActive: boolean;
  }>;
}

export default function PartnersPage() {
  const { t } = useTranslation();
  const [editingPartner, setEditingPartner] = useState<PartnerWithSubCategories | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; isOpen: boolean }>({
    url: '',
    isOpen: false
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const steps = [
    'Basic Information', 
    'Media & Description', 
    'Text Fields', 
    'Images & Status',
    'Sub Categories'
  ];

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['partners', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => partnerService.getPaginated({
      page: currentPage,
      pageSize,
      searchTerm: debouncedSearchTerm || undefined,
    }),
    enabled: !showForm, // Don't fetch data when form is open
  });

  // Fetch sub categories from API
  const { data: subCategories = [], isLoading: isLoadingSubCategories } = useQuery({
    queryKey: ['subCategories'],
    queryFn: () => subCategoryService.getAll(true), // include inactive if needed
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories to get category names for display
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  // Function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    trigger,
    control,
    setValue,
    watch,
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema as any), // Use any to bypass the type issues
    defaultValues: {
      isActive: true,
      cvr: 0,
      businessUnit: 0,
      userId: 0,
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
    },
  });

  // Watch image URLs for preview
  const logoUrlValue = watch('logoUrl');
  const imageUrl1Value = watch('imageUrl1');
  const imageUrl2Value = watch('imageUrl2');
  const imageUrl3Value = watch('imageUrl3');
  const imageUrl4Value = watch('imageUrl4');
  const imageUrl5Value = watch('imageUrl5');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parSubCatlst',
  });

  useEffect(() => {
    if (editingPartner && showForm) {
      // Transform the partner data to match the form structure
      const formData: PartnerFormData = {
        userId: editingPartner.userId,
        address: editingPartner.address,
        businessUnit: editingPartner.businessUnit,
        videoUrl: editingPartner.videoUrl || '',
        logoUrl: editingPartner.logoUrl || '',
        cvr: editingPartner.cvr,
        descriptionShort: editingPartner.descriptionShort || '',
        textField1: editingPartner.textField1 || '',
        textField2: editingPartner.textField2 || '',
        textField3: editingPartner.textField3 || '',
        textField4: editingPartner.textField4 || '',
        textField5: editingPartner.textField5 || '',
        imageUrl1: editingPartner.imageUrl1 || '',
        imageUrl2: editingPartner.imageUrl2 || '',
        imageUrl3: editingPartner.imageUrl3 || '',
        imageUrl4: editingPartner.imageUrl4 || '',
        imageUrl5: editingPartner.imageUrl5 || '',
        isActive: editingPartner.isActive,
        parSubCatlst: editingPartner.parSubCatlst && editingPartner.parSubCatlst.length > 0 
          ? editingPartner.parSubCatlst.map((subCat) => ({
              id: subCat.id,
              patnerId: subCat.patnerId,
              subCategoryId: subCat.subCategoryId,
              isActive: subCat.isActive,
            }))
          : [{ subCategoryId: 0, isActive: true }],
      };
      reset(formData);
    } else if (!showForm) {
      resetForm();
    }
  }, [editingPartner, showForm, reset]);

  const resetForm = () => {
    const defaultValues: PartnerFormData = {
      userId: 0,
      address: '',
      businessUnit: 0,
      videoUrl: '',
      logoUrl: '',
      cvr: 0,
      descriptionShort: '',
      textField1: '',
      textField2: '',
      textField3: '',
      textField4: '',
      textField5: '',
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      imageUrl4: '',
      imageUrl5: '',
      isActive: true,
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
    };
    reset(defaultValues);
    setCurrentStep(1);
    setEditingPartner(null);
  };

  const createMutation = useMutation({
    mutationFn: partnerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'], exact: false });
      toast.success(t('admin.partners.createSuccess') || 'Partner created successfully');
      handleFormClose();
    },
    onError: () => {
      toast.error(t('admin.partners.createError') || 'Failed to create partner');
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: partnerService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'], exact: false });
      toast.success(t('admin.partners.updateSuccess') || 'Partner updated successfully');
      handleFormClose();
    },
    onError: () => {
      toast.error(t('admin.partners.updateError') || 'Failed to update partner');
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: partnerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'], exact: false });
      toast.success(t('admin.partners.deleteSuccess') || 'Partner deleted successfully');
    },
    onError: () => toast.error(t('admin.partners.deleteError') || 'Failed to delete partner'),
  });

  const onSubmit = async (data: PartnerFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...data,
        id: editingPartner?.id,
        parSubCatlst: data.parSubCatlst.map(subCat => ({
          ...subCat,
          patnerId: editingPartner?.id || 0, // Will be set by backend for new partners
        })),
      };

      if (editingPartner) {
        await updateMutation.mutateAsync(payload as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await trigger(['userId', 'address', 'businessUnit', 'cvr']);
    } else if (currentStep === 2) {
      isValid = await trigger(['videoUrl', 'logoUrl', 'descriptionShort']);
    } else if (currentStep === 3) {
      isValid = await trigger(['textField1', 'textField2', 'textField3', 'textField4', 'textField5']);
    } else if (currentStep === 4) {
      isValid = await trigger(['imageUrl1', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5', 'isActive']);
    } else {
      isValid = await trigger(['parSubCatlst']);
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const handleFormClose = () => {
    setShowForm(false);
    resetForm();
    setIsSubmitting(false);
  };

  const handleAddPartner = () => {
    setEditingPartner(null);
    setShowForm(true);
    resetForm();
  };

  const handleEditPartner = (partner: Partner) => {
    // Cast to PartnerWithSubCategories since we'll handle parSubCatlst
    setEditingPartner(partner as PartnerWithSubCategories);
    setShowForm(true);
  };

  const addSubCategoryField = () => {
    append({ subCategoryId: 0, isActive: true });
  };

  const removeSubCategoryField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleImagePreview = (url: string) => {
    setPreviewImage({ url, isOpen: true });
  };

  // Map the API response based on your structure
  const partners = paginatedData?.output?.result || [];
  const totalItems = paginatedData?.output?.rowCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const columns: ColumnDef<Partner>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'userId', header: 'User ID' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'businessUnit', header: 'Business Unit' },
    { accessorKey: 'cvr', header: 'CVR' },
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
          <Button 
            variant="secondary" 
            onClick={() => handleEditPartner(row.original)}
            disabled={showForm}
          >
            {t('common.edit')}
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              if (window.confirm(t('admin.partners.deleteConfirm') || 'Delete this partner?')) {
                deleteMutation.mutate(row.original.id);
              }
            }}
            disabled={showForm}
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="User ID" 
                type="number"
                error={errors.userId?.message} 
                {...register('userId', { valueAsNumber: true })} 
              />
              <Input 
                label="Business Unit" 
                type="number"
                error={errors.businessUnit?.message} 
                {...register('businessUnit', { valueAsNumber: true })} 
              />
            </div>
            <Input label="Address" error={errors.address?.message} {...register('address')} />
            <Input 
              label="CVR" 
              type="number"
              error={errors.cvr?.message} 
              {...register('cvr', { valueAsNumber: true })} 
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Media & Description</h3>
            <Input label="Video URL" error={errors.videoUrl?.message} {...register('videoUrl')} />
            
            {/* Logo URL with ImageUpload */}
            <ImageUpload
              label="Logo URL"
              value={logoUrlValue}
              onChange={(url) => setValue('logoUrl', url)}
              onPreview={handleImagePreview}
              folder="partners/logos"
              error={errors.logoUrl?.message}
            />
            
            <TextArea 
              label="Short Description" 
              error={errors.descriptionShort?.message} 
              rows={3}
              {...register('descriptionShort')} 
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Text Fields</h3>
            <Input label="Text Field 1" error={errors.textField1?.message} {...register('textField1')} />
            <Input label="Text Field 2" error={errors.textField2?.message} {...register('textField2')} />
            <Input label="Text Field 3" error={errors.textField3?.message} {...register('textField3')} />
            <Input label="Text Field 4" error={errors.textField4?.message} {...register('textField4')} />
            <Input label="Text Field 5" error={errors.textField5?.message} {...register('textField5')} />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Images & Status</h3>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Image URLs</h4>
              
              {/* Image URL 1 with ImageUpload */}
              <ImageUpload
                label="Image URL 1"
                value={imageUrl1Value}
                onChange={(url) => setValue('imageUrl1', url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl1?.message}
              />

              {/* Image URL 2 with ImageUpload */}
              <ImageUpload
                label="Image URL 2"
                value={imageUrl2Value}
                onChange={(url) => setValue('imageUrl2', url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl2?.message}
              />

              {/* Image URL 3 with ImageUpload */}
              <ImageUpload
                label="Image URL 3"
                value={imageUrl3Value}
                onChange={(url) => setValue('imageUrl3', url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl3?.message}
              />

              {/* Image URL 4 with ImageUpload */}
              <ImageUpload
                label="Image URL 4"
                value={imageUrl4Value}
                onChange={(url) => setValue('imageUrl4', url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl4?.message}
              />

              {/* Image URL 5 with ImageUpload */}
              <ImageUpload
                label="Image URL 5"
                value={imageUrl5Value}
                onChange={(url) => setValue('imageUrl5', url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl5?.message}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="isActive" 
                {...register('isActive')} 
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                {t('common.active')}
              </label>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Sub Categories</h3>
            <p className="text-sm text-gray-600">
              Add one or more sub categories for this partner
            </p>

            {isLoadingSubCategories ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading sub categories...</p>
              </div>
            ) : (
              <>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <Select
                        label={`Sub Category ${index + 1}`}
                        error={errors.parSubCatlst?.[index]?.subCategoryId?.message}
                        {...register(`parSubCatlst.${index}.subCategoryId`, { valueAsNumber: true })}
                      >
                        <option value={0}>Select Sub Category</option>
                        {subCategories
                          .filter(subCat => subCat.isActive) // Only show active sub categories
                          .map(subCat => (
                            <option key={subCat.id} value={subCat.id}>
                              {subCat.name} ({getCategoryName(subCat.categoryId)})
                            </option>
                          ))
                        }
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <input 
                        type="checkbox" 
                        id={`isActive-${index}`}
                        {...register(`parSubCatlst.${index}.isActive`)} 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor={`isActive-${index}`} className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeSubCategoryField(index)}
                        className="mb-1"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addSubCategoryField}
                >
                  Add Another Sub Category
                </Button>

                {errors.parSubCatlst && !errors.parSubCatlst.root && (
                  <p className="text-red-500 text-sm mt-2">{errors.parSubCatlst.message}</p>
                )}
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-3">
      {/* Header Section - Only show when form is NOT open */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('admin.partners.title') || "Partners"}</h1>
              <p className="text-gray-600 text-sm mt-1">{t('admin.partners.subtitle') || "Manage your partners"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>
              <button
                onClick={handleAddPartner}
                disabled={showForm}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('admin.partners.addPartner')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section - Only show when form is open */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingPartner ? t('admin.partners.editPartner') : t('admin.partners.addPartner')}
            </h2>
            <Button variant="secondary" onClick={handleFormClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
          </div>

          <Stepper currentStep={currentStep} steps={steps} className="mb-8" />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-1 mb-6">
              {renderStepContent()}
            </div>
            
            <div className="flex justify-between pt-6 mt-4 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {currentStep < steps.length ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  >
                    {isSubmitting ? 'Submitting...' : editingPartner ? t('common.update') : t('common.create')}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Data Table Section - Only show when form is NOT open */}
      {!showForm && (
        <>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <DataTable data={partners} columns={columns} />
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
        </>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: '', isOpen: false })}
      />
    </div>
  );
}
// src/features/admin/partners/PartnersPage.tsx
import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnerService } from "../../../services/partner.service";
import { subCategoryService } from "../../../services/subCategory.service";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Stepper from "../../../components/common/Stepper";
import TextArea from "../../../components/common/TextArea";
import ImageUpload from "../../../components/common/ImageUpload";
import VideoUpload from "../../../components/common/VideoUpload";
import VideoPreviewModal from "../../../components/common/VideoPreviewModal";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  Partner,
  PartnerDocument,
  PartnerSubCategory,
} from "../../../types/partner";
import { categoryService } from "../../../services/category.service";
import type { SubCategory } from "../../../types/subcategory";
import type { Category } from "../../../types/category";
import SearchableSelectController from "../../../components/common/SearchableSelectController";
import DocumentUpload from "../../../components/common/DocumentUpload";
import { FaEdit, FaTrash, FaFileExport } from "react-icons/fa"; // Added FaFileExport
import { exportToExcel } from "../../../utils/export.utils"; // Added export utility

// Image Preview Modal Component
function ImagePreviewModal({
  imageUrl,
  isOpen,
  onClose,
}: {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) {
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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

// Schemas
const partnerSubCategorySchema = z.object({
  id: z.number().optional(),
  partnerId: z.number().optional(),
  subCategoryId: z.number().min(1, "Sub Category is required"),
  isActive: z.boolean(),
});

const partnerDocumentSchema = z.object({
  id: z.number().optional(),
  partnerId: z.number().optional(),
  documentName: z.string().min(1, "Document name is required"),
  documentUrl: z.string().min(1, "Document URL is required"),
  isActive: z.boolean(),
});

const partnerSchema = z.object({
  userId: z.number().optional(),
  categoryId: z.number().min(1, "Category is required"),
  address: z.string().min(1, "Address is required"),
  businessUnit: z.number().min(1, "Business Unit is required"),
  businessName: z.string().min(1, "Business Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobileNo: z.number().optional(),
  videoUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  cvr: z.number().min(0, "CVR is required"),
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
  parSubCatlst: z
    .array(partnerSubCategorySchema)
    .min(1, "At least one sub category is required"),
  parDoclst: z
    .array(partnerDocumentSchema)
    .min(1, "At least one document is required"),
});

type PartnerFormData = {
  userId?: number;
  categoryId: number;
  address: string;
  businessName: string;
  email?: string;
  mobileNo?: number;
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
  parSubCatlst: PartnerSubCategory[];
  parDoclst: PartnerDocument[];
};

export default function PartnersPage() {
  const { t } = useTranslation();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active"); // Added status filter
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // Added export state
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    isOpen: boolean;
  }>({
    url: "",
    isOpen: false,
  });
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    isOpen: boolean;
  }>({
    url: "",
    isOpen: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // UPDATED: Steps reordered - Documents is now step 5, Categories & Sub Categories is step 6
  const steps = [
    "Basic Information",
    "Media & Description",
    "Text Fields",
    "Images & Status",
    "Documents", // MOVED TO STEP 5
    "Categories & Sub Categories", // MOVED TO STEP 6
  ];

  // Initialize react-hook-form FIRST
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
    resolver: zodResolver(partnerSchema as any),
    defaultValues: {
      isActive: true,
      cvr: 0,
      businessUnit: 0,
      categoryId: 0,
      userId: 0,
      businessName: "",
      email: "",
      mobileNo: 0,
      address: "",
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [{ documentName: "", documentUrl: "", isActive: true }],
    },
  });

  // Initialize field arrays AFTER control is defined
  const {
    fields: subCategoryFields,
    append: appendSubCategory,
    remove: removeSubCategory,
  } = useFieldArray({
    control,
    name: "parSubCatlst",
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "parDoclst",
  });

  // Watch values AFTER form initialization
  const logoUrlValue = watch("logoUrl");
  const videoUrlValue = watch("videoUrl");
  const imageUrl1Value = watch("imageUrl1");
  const imageUrl2Value = watch("imageUrl2");
  const imageUrl3Value = watch("imageUrl3");
  const imageUrl4Value = watch("imageUrl4");
  const imageUrl5Value = watch("imageUrl5");
  const categoryIdValue = watch("categoryId");

  // Fetch all partners without client-side filtering
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["partners", currentPage, pageSize, debouncedSearchTerm],
    queryFn: () =>
      partnerService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
      }),
    enabled: !showForm,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subCategories = [], isLoading: isLoadingSubCategories } =
    useQuery<SubCategory[]>({
      queryKey: ["subCategories", selectedCategoryId],
      queryFn: () => subCategoryService.getAll(true),
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (selectedCategoryId > 0) {
          return data.filter(
            (subCat) => subCat.categoryId === selectedCategoryId
          );
        }
        return data;
      },
    });

  // Function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  // Update selected category when categoryId changes in form
  useEffect(() => {
    if (categoryIdValue && categoryIdValue > 0) {
      setSelectedCategoryId(categoryIdValue);
    }
  }, [categoryIdValue]);

  useEffect(() => {
    if (editingPartner && showForm) {
      const formData: PartnerFormData = {
        userId: editingPartner.userId,
        categoryId: editingPartner.categoryId,
        address: editingPartner.address,
        businessName: editingPartner.businessName,
        email: editingPartner.email,
        mobileNo: editingPartner.mobileNo,
        businessUnit: editingPartner.businessUnit,
        videoUrl: editingPartner.videoUrl || "",
        logoUrl: editingPartner.logoUrl || "",
        cvr: editingPartner.cvr,
        descriptionShort: editingPartner.descriptionShort || "",
        textField1: editingPartner.textField1 || "",
        textField2: editingPartner.textField2 || "",
        textField3: editingPartner.textField3 || "",
        textField4: editingPartner.textField4 || "",
        textField5: editingPartner.textField5 || "",
        imageUrl1: editingPartner.imageUrl1 || "",
        imageUrl2: editingPartner.imageUrl2 || "",
        imageUrl3: editingPartner.imageUrl3 || "",
        imageUrl4: editingPartner.imageUrl4 || "",
        imageUrl5: editingPartner.imageUrl5 || "",
        isActive: editingPartner.isActive,
        parSubCatlst:
          editingPartner.parSubCatlst && editingPartner.parSubCatlst.length > 0
            ? editingPartner.parSubCatlst.map((subCat) => ({
                id: subCat.id,
                partnerId: subCat.partnerId,
                subCategoryId: subCat.subCategoryId,
                isActive: subCat.isActive,
              }))
            : [{ subCategoryId: 0, isActive: true }],
        parDoclst:
          editingPartner.parDoclst && editingPartner.parDoclst.length > 0
            ? editingPartner.parDoclst.map((doc) => ({
                id: doc.id,
                partnerId: doc.partnerId,
                documentName: doc.documentName,
                documentUrl: doc.documentUrl,
                isActive: doc.isActive,
              }))
            : [{ documentName: "", documentUrl: "", isActive: true }],
      };
      reset(formData);
      setSelectedCategoryId(editingPartner.categoryId);
    } else if (!showForm) {
      resetForm();
    }
  }, [editingPartner, showForm, reset]);

  const resetForm = () => {
    const defaultValues: PartnerFormData = {
      userId: 0,
      categoryId: 0,
      address: "",
      businessUnit: 0,
      businessName: "",
      email: "",
      mobileNo: 0,
      videoUrl: "",
      logoUrl: "",
      cvr: 0,
      descriptionShort: "",
      textField1: "",
      textField2: "",
      textField3: "",
      textField4: "",
      textField5: "",
      imageUrl1: "",
      imageUrl2: "",
      imageUrl3: "",
      imageUrl4: "",
      imageUrl5: "",
      isActive: true,
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [{ documentName: "", documentUrl: "", isActive: true }],
    };
    reset(defaultValues);
    setCurrentStep(1);
    setEditingPartner(null);
    setSelectedCategoryId(0);
  };

  const createMutation = useMutation({
    mutationFn: partnerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"], exact: false });
      toast.success(
        t("admin.partners.createSuccess") || "Partner created successfully"
      );
      handleFormClose();
    },
    onError: () => {
      toast.error(
        t("admin.partners.createError") || "Failed to create partner"
      );
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: partnerService.update,
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
      toast.success(
        t("admin.partners.updateSuccess") || "Partner updated successfully"
      );
      handleFormClose();
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast.error(
        t("admin.partners.updateError") || "Failed to update partner"
      );
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: partnerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"], exact: false });
      toast.success(
        t("admin.partners.deleteSuccess") || "Partner deleted successfully"
      );
    },
    onError: () =>
      toast.error(
        t("admin.partners.deleteError") || "Failed to delete partner"
      ),
  });

  // Export functionality
  const handleExportPartners = async () => {
    try {
      setIsExporting(true);

      // Prepare export parameters according to API spec
      const exportParams: Record<string, any> = {
        includeIsActive: true,
      };

      // Add search term if present
      if (debouncedSearchTerm) {
        exportParams.searchTerm = debouncedSearchTerm;
      }

      console.log("Exporting partners with params:", exportParams);

      // Use the export utility with ReportType = 'Partner'
      await exportToExcel("Partner", exportParams);
    } catch (error) {
      // Error is already handled in exportToExcel utility
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const onSubmit = async (data: PartnerFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const subCategoriesPayload = data.parSubCatlst.map((subCat) => ({
        id: subCat.id,
        partnerId: editingPartner?.id || 0,
        subCategoryId: subCat.subCategoryId,
        isActive: subCat.isActive,
      }));

      const documentsPayload = data.parDoclst.map((doc) => ({
        id: doc.id,
        partnerId: editingPartner?.id || 0,
        documentName: doc.documentName,
        documentUrl: doc.documentUrl,
        isActive: doc.isActive,
      }));

      const payload = {
        ...data,
        id: editingPartner?.id,
        parSubCatlst: subCategoriesPayload,
        parDoclst: documentsPayload,
        email: data.email || undefined,
        mobileNo: data.mobileNo || undefined,
      };

      console.log("Submitting payload:", payload);

      if (editingPartner) {
        await updateMutation.mutateAsync(payload as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger([
        "address",
        "businessUnit",
        "businessName",
        "cvr",
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger(["videoUrl", "logoUrl", "descriptionShort"]);
    } else if (currentStep === 3) {
      isValid = await trigger([
        "textField1",
        "textField2",
        "textField3",
        "textField4",
        "textField5",
      ]);
    } else if (currentStep === 4) {
      isValid = await trigger([
        "imageUrl1",
        "imageUrl2",
        "imageUrl3",
        "imageUrl4",
        "imageUrl5",
        "isActive",
      ]);
    } else if (currentStep === 5) {
      // UPDATED: Now validating documents in step 5
      isValid = await trigger(["parDoclst"]);
    } else if (currentStep === 6) {
      // UPDATED: Now validating categories in step 6
      isValid = await trigger(["categoryId", "parSubCatlst"]);
    } else {
      isValid = true;
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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

  // Add status filter handler
  const handleStatusFilterChange = (filter: "all" | "active" | "inactive") => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
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
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleDeletePartner = (partner: Partner) => {
    if (!partner.id) return;

    const partnerName = partner.businessName;
    const confirmMessage =
      t("admin.partners.deleteConfirm") ||
      "Are you sure you want to delete this partner?";

    // Use Sonner toast for confirmation instead of window.confirm
    toast(
      <div className="w-full">
        <div className="font-semibold text-gray-900 mb-2">Confirm Deletion</div>
        <div className="text-sm text-gray-600 mb-4">
          {confirmMessage}
          <br />
          <strong>Partner: {partnerName}</strong>
          <br />
          <span className="text-xs">CVR: {partner.cvr}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => toast.dismiss()}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              deleteMutation.mutate(partner.id);
              toast.dismiss();
            }}
          >
            Delete
          </Button>
        </div>
      </div>,
      {
        duration: 10000, // 10 seconds
        position: "top-center",
        closeButton: true,
      }
    );
  };

  const addSubCategoryField = () => {
    appendSubCategory({ subCategoryId: 0, isActive: true });
  };

  const removeSubCategoryField = (index: number) => {
    if (subCategoryFields.length > 1) {
      removeSubCategory(index);
    }
  };

  const addDocumentField = () => {
    appendDocument({ documentName: "", documentUrl: "", isActive: true });
  };

  const removeDocumentField = (index: number) => {
    if (documentFields.length > 1) {
      removeDocument(index);
    }
  };

  const handleImagePreview = (url: string) => {
    setPreviewImage({ url, isOpen: true });
  };

  const handleVideoPreview = (url: string) => {
    setPreviewVideo({ url, isOpen: true });
  };

  // Handle category change - reset subcategories when category changes
  const handleCategoryChange = (categoryId: number | string) => {
    const categoryIdNum =
      typeof categoryId === "string" ? parseInt(categoryId, 10) : categoryId;

    setSelectedCategoryId(categoryIdNum);

    // Reset all subcategory fields when category changes
    if (subCategoryFields.length > 0) {
      subCategoryFields.forEach((_, index) => {
        setValue(`parSubCatlst.${index}.subCategoryId`, 0);
      });
    }
  };

  // Map the API response based on your structure
  const allPartners = paginatedData?.output?.result || [];

  // Apply client-side filtering based on status filter
  const filteredPartners = useMemo(() => {
    let filtered = allPartners;

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((partner) => partner.isActive === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((partner) => partner.isActive === false);
    }
    // If statusFilter is 'all', no filtering needed

    return filtered;
  }, [allPartners, statusFilter]);

  // For pagination, we need to handle the filtered data
  const totalItems = filteredPartners.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPartners.slice(startIndex, endIndex);
  }, [filteredPartners, currentPage, pageSize]);

  const columns: ColumnDef<Partner>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "businessName", header: "Business Name" },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => getCategoryName(row.original.categoryId),
    },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "businessUnit", header: "Business Unit" },
    { accessorKey: "cvr", header: "CVR" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className="px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{
            backgroundColor: row.original.isActive
              ? "var(--color-secondary)"
              : "var(--color-neutral)",
          }}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditPartner(row.original)}
            disabled={showForm}
            className="p-2 text-gray-600 transition-colors hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit partner"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletePartner(row.original)}
            disabled={showForm}
            className="p-2 text-red-600 transition-colors hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete partner"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Business Name"
                error={errors.businessName?.message}
                {...register("businessName")}
              />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Mobile Number"
                error={errors.mobileNo?.message}
                {...register("mobileNo", { valueAsNumber: true })}
              />
              <Input
                label="Business Unit"
                type="number"
                error={errors.businessUnit?.message}
                {...register("businessUnit", { valueAsNumber: true })}
              />
              <Input
                label="CVR"
                type="number"
                error={errors.cvr?.message}
                {...register("cvr", { valueAsNumber: true })}
              />
            </div>

            <TextArea
              label="Address"
              error={errors.address?.message}
              rows={3}
              placeholder="Enter full address"
              {...register("address")}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Media & Description
            </h3>

            {/* Video Upload with VideoUpload component */}
            <VideoUpload
              label="Video Upload"
              value={videoUrlValue}
              onChange={(url) => setValue("videoUrl", url)}
              onPreview={handleVideoPreview}
              folder="partners/videos"
              error={errors.videoUrl?.message}
            />

            {/* Logo Upload with ImageUpload */}
            <ImageUpload
              label="Logo Upload"
              value={logoUrlValue}
              onChange={(url) => setValue("logoUrl", url)}
              onPreview={handleImagePreview}
              folder="partners/logos"
              error={errors.logoUrl?.message}
            />

            <TextArea
              label="Short Description"
              error={errors.descriptionShort?.message}
              rows={3}
              {...register("descriptionShort")}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Text Fields</h3>
            <Input
              label="Text Field 1"
              error={errors.textField1?.message}
              {...register("textField1")}
            />
            <Input
              label="Text Field 2"
              error={errors.textField2?.message}
              {...register("textField2")}
            />
            <Input
              label="Text Field 3"
              error={errors.textField3?.message}
              {...register("textField3")}
            />
            <Input
              label="Text Field 4"
              error={errors.textField4?.message}
              {...register("textField4")}
            />
            <Input
              label="Text Field 5"
              error={errors.textField5?.message}
              {...register("textField5")}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Images & Status
            </h3>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Image URLs</h4>

              <ImageUpload
                label="Image Upload 1"
                value={imageUrl1Value}
                onChange={(url) => setValue("imageUrl1", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl1?.message}
              />

              <ImageUpload
                label="Image Upload 2"
                value={imageUrl2Value}
                onChange={(url) => setValue("imageUrl2", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl2?.message}
              />

              <ImageUpload
                label="Image Upload 3"
                value={imageUrl3Value}
                onChange={(url) => setValue("imageUrl3", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl3?.message}
              />

              <ImageUpload
                label="Image Upload 4"
                value={imageUrl4Value}
                onChange={(url) => setValue("imageUrl4", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl4?.message}
              />

              <ImageUpload
                label="Image Upload 5"
                value={imageUrl5Value}
                onChange={(url) => setValue("imageUrl5", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl5?.message}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                {t("common.active")}
              </label>
            </div>
          </div>
        );

      // UPDATED: Case 5 is now Documents
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                Partner Documents
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Add one or more documents for this partner (business licenses,
                contracts, certificates, etc.)
              </p>

              {documentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
                >
                  <div className="space-y-4 mb-4">
                    <Input
                      label={`Document Name ${index + 1}`}
                      error={errors.parDoclst?.[index]?.documentName?.message}
                      {...register(`parDoclst.${index}.documentName` as const)}
                      placeholder="Enter document name (e.g., Business License, Contract, Certificate)"
                      required
                    />

                    {/* Using the new DocumentUpload component */}
                    <DocumentUpload
                      label={`Document File ${index + 1}`}
                      value={watch(`parDoclst.${index}.documentUrl`)}
                      onChange={(url) =>
                        setValue(`parDoclst.${index}.documentUrl`, url)
                      }
                      onPreview={(url) => {
                        // Open document in new tab for preview
                        window.open(url, "_blank");
                      }}
                      folder="partners/documents"
                      error={errors.parDoclst?.[index]?.documentUrl?.message}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`doc-isActive-${index}`}
                        {...register(`parDoclst.${index}.isActive` as const)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={`doc-isActive-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Active
                      </label>
                    </div>

                    {documentFields.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeDocumentField(index)}
                        disabled={documentFields.length <= 1}
                      >
                        Remove Document
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={addDocumentField}
              >
                + Add Another Document
              </Button>

              {errors.parDoclst && !errors.parDoclst.root && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.parDoclst.message}
                </p>
              )}
            </div>

            {/* Uploaded Documents Summary */}
            {documentFields.some((_, index) => {
              const docUrl = watch(`parDoclst.${index}.documentUrl` as const);
              return !!docUrl;
            }) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">
                  Uploaded Documents
                </h4>
                <div className="space-y-2">
                  {documentFields.map((field, index) => {
                    const docUrl = watch(`parDoclst.${index}.documentUrl`);
                    const docName = watch(`parDoclst.${index}.documentName`);

                    if (!docUrl) return null;

                    const getFileIcon = (url: string) => {
                      if (url.includes(".pdf")) return "📄 PDF";
                      if (url.includes(".doc")) return "📝 Word";
                      if (url.includes(".xls")) return "📊 Excel";
                      if (url.includes(".ppt")) return "📽️ PowerPoint";
                      if (url.includes(".txt")) return "📃 Text";
                      return "📎 File";
                    };

                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {getFileIcon(docUrl).split(" ")[0]}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {docName || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getFileIcon(docUrl)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(docUrl, "_blank")}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                          <a
                            href={docUrl}
                            download
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      // UPDATED: Case 6 is now Categories & Sub Categories
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Categories & Sub Categories
            </h3>

            {/* Category Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                Select Category
              </h4>

              {isLoadingCategories ? (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="mt-1 text-gray-600 text-sm">
                    Loading categories...
                  </p>
                </div>
              ) : (
                <SearchableSelectController
                  name="categoryId"
                  control={control}
                  label="Category"
                  error={errors.categoryId?.message}
                  options={categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                  placeholder={
                    isLoadingCategories
                      ? "Loading categories..."
                      : categories.filter((cat) => cat.isActive).length === 0
                      ? "No active categories available"
                      : "Select Category"
                  }
                  disabled={
                    isLoadingCategories ||
                    categories.filter((cat) => cat.isActive).length === 0
                  }
                  required={true}
                  onChange={handleCategoryChange}
                />
              )}

              {!isLoadingCategories &&
                categories.filter((cat) => cat.isActive).length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        No Active Categories Available
                      </span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      You need to create active categories before adding
                      partners.
                    </p>
                  </div>
                )}
            </div>

            {/* Sub Categories Section */}
            {selectedCategoryId > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  Sub Categories
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add one or more sub categories for this partner under the
                  selected category
                </p>

                {isLoadingSubCategories ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">
                      Loading sub categories...
                    </p>
                  </div>
                ) : (
                  <>
                    {subCategoryFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-end gap-4 p-4 border border-gray-200 rounded-lg mb-3"
                      >
                        <div className="flex-1">
                          <SearchableSelectController
                            name={`parSubCatlst.${index}.subCategoryId`}
                            control={control}
                            label={`Sub Category ${index + 1}`}
                            error={
                              errors.parSubCatlst?.[index]?.subCategoryId
                                ?.message
                            }
                            options={subCategories
                              .filter((subCat) => subCat.isActive)
                              .map((subCat) => ({
                                value: subCat.id,
                                label: subCat.name,
                              }))}
                            placeholder={
                              isLoadingSubCategories
                                ? "Loading sub categories..."
                                : subCategories.filter(
                                    (subCat) => subCat.isActive
                                  ).length === 0
                                ? "No active sub categories available for this category"
                                : "Select Sub Category"
                            }
                            disabled={
                              isLoadingSubCategories ||
                              subCategories.filter((subCat) => subCat.isActive)
                                .length === 0
                            }
                            required={true}
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            id={`isActive-${index}`}
                            {...register(`parSubCatlst.${index}.isActive`)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label
                            htmlFor={`isActive-${index}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Active
                          </label>
                        </div>

                        {subCategoryFields.length > 1 && (
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
                      disabled={
                        subCategories.filter((subCat) => subCat.isActive)
                          .length === 0
                      }
                    >
                      Add Another Sub Category
                    </Button>

                    {!isLoadingSubCategories &&
                      subCategories.filter((subCat) => subCat.isActive)
                        .length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              No Active Sub Categories Available
                            </span>
                          </div>
                          <p className="text-yellow-700 text-sm mt-1">
                            There are no active subcategories available for the
                            selected category.
                          </p>
                        </div>
                      )}
                  </>
                )}

                {errors.parSubCatlst && !errors.parSubCatlst.root && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.parSubCatlst.message}
                  </p>
                )}
              </div>
            )}

            {selectedCategoryId === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">Select a Category First</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Please select a category above to see available subcategories.
                </p>
              </div>
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
              <h1 className="text-xl font-bold text-gray-900">
                {t("admin.partners.title") || "Partners"}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {t("admin.partners.subtitle") || "Manage your partners"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Filter Dropdown */}
              <div className="w-32">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    handleStatusFilterChange(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>

              {/* Export Button */}
              <Button
                variant="secondary"
                size="md"
                onClick={handleExportPartners}
                disabled={isExporting}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <FaFileExport className="w-4 h-4" />
                {isExporting
                  ? t("common.exporting") || "Exporting..."
                  : t("common.export") || "Export"}
              </Button>

              <button
                onClick={handleAddPartner}
                disabled={showForm}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:opacity-90 bg-brand-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("admin.partners.addPartner")}
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
              {editingPartner
                ? t("admin.partners.editPartner")
                : t("admin.partners.addPartner")}
            </h2>
            <Button
              variant="secondary"
              onClick={handleFormClose}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
          </div>

          <Stepper currentStep={currentStep} steps={steps} className="mb-8" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-1 mb-6">{renderStepContent()}</div>

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
                    disabled={
                      isSubmitting ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : editingPartner
                      ? t("common.update")
                      : t("common.create")}
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
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: "var(--color-primary)" }}
              ></div>
              <p className="mt-4 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
        </>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: "", isOpen: false })}
      />

      {/* Video Preview Modal */}
      <VideoPreviewModal
        videoUrl={previewVideo.url}
        isOpen={previewVideo.isOpen}
        onClose={() => setPreviewVideo({ url: "", isOpen: false })}
      />
    </div>
  );
}

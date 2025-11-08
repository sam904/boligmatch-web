import { useState, useEffect } from "react";
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
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";
import ImageUpload from "../../../components/common/ImageUpload";
import VideoUpload from "../../../components/common/VideoUpload";
import VideoPreviewModal from "../../../components/common/VideoPreviewModal";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";
import AdminToast from "../../../components/common/AdminToast";
import type { AdminToastType } from "../../../components/common/AdminToast";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  Partner,
  PartnerDocument,
  PartnerSubCategory,
} from "../../../types/partner";
import { partnerDocumentService } from "../../../services/partnerdocument.service";
import type { PartnerDocumentDto } from "../../../types/partnerdocument";
import { categoryService } from "../../../services/category.service";
import type { SubCategory } from "../../../types/subcategory";
import type { Category } from "../../../types/category";
import SearchableSelectController from "../../../components/common/SearchableSelectController";
import DocumentUpload from "../../../components/common/DocumentUpload";
import Modal from "../../../components/common/Modal";
import { userService } from "../../../services/user.service";
import { exportToExcel } from "../../../utils/export.utils";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconUpload,
  IconArrowLeft,
  IconKey,
  IconNoRecords,
} from "../../../components/common/Icons/Index";
import { FilterDropdown } from "../../../components/common/FilterDropdown";

// Toast state interface
interface ToastState {
  id: string;
  type: AdminToastType;
  message: string;
  title?: string;
  subtitle?: string;
  open: boolean;
}

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
            className="text-[#171717] border border-[#171717] hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="p-4 border-t text-left">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline "
          >
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}

// Logo Upload Component with exact 512x512 Validation
function LogoUploadWithValidation({
  value,
  onChange,
  onPreview,
  error,
  label = "Company Logo",
}: {
  value: string;
  onChange: (url: string) => void;
  onPreview: (url: string) => void;
  error?: string;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ImageUpload
          label={label}
          value={value}
          onChange={onChange}
          onPreview={onPreview}
          folder="partners/logos"
          error={error}
          exactDimensions={{ width: 512, height: 512 }}
          showDimensionValidation={true}
        />
      </div>
    </div>
  );
}

// Schemas - UPDATED WITH STATUS FIELD
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

// Password reset schema
const passwordResetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordResetData = z.infer<typeof passwordResetSchema>;

// UPDATED PARTNER SCHEMA WITH STATUS FIELD
const partnerSchema = z.object({
  userId: z.number().optional(),
  categoryId: z.number().min(1, "Category is required"),
  address: z.string().min(1, "Address is required"),
  businessName: z.string().min(1, "Business Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobileNo: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number cannot exceed 15 digits")
    .regex(
      /^[0-9+-\s()]+$/,
      "Mobile number can only contain numbers, +, -, (, ) and spaces"
    )
    .optional()
    .or(z.literal("")),
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
  thumbnail: z.string().optional(),
  isActive: z.boolean(),
  status: z.enum(["All", "Active", "InActive"]), // ADDED STATUS FIELD
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
  mobileNo?: string;
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
  thumbnail?: string;
  isActive: boolean;
  status: "All" | "Active" | "InActive"; // ADDED STATUS FIELD
  parSubCatlst: PartnerSubCategory[];
  parDoclst: PartnerDocument[];
};

type FieldPath<T> = keyof T | string;
type ValidFieldNames =
  | FieldPath<PartnerFormData>
  | `parDoclst.${number}.${keyof PartnerDocument}`
  | `parSubCatlst.${number}.${keyof PartnerSubCategory}`;

export default function PartnersPage() {
  const { t } = useTranslation();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [resettingPartner, setResettingPartner] = useState<Partner | null>(
    null
  );
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "InActive"
  >("All"); // UPDATED STATUS FILTER
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savingDocuments, setSavingDocuments] = useState<number[]>([]);
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
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
    isOpen: boolean;
  }>({
    url: "",
    name: "",
    isOpen: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    partner: Partner | null;
  }>({
    isOpen: false,
    partner: null,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Toast management functions
  const showToast = (
    type: AdminToastType,
    message: string,
    title?: string,
    subtitle?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastState = {
      id,
      type,
      message,
      title,
      subtitle,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const toast = {
    success: (message: string, title?: string, subtitle?: string) =>
      showToast("success", message, title, subtitle),
    error: (message: string, title?: string, subtitle?: string) =>
      showToast("error", message, title, subtitle),
    info: (message: string, title?: string, subtitle?: string) =>
      showToast("info", message, title, subtitle),
  };

  // Helper function to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
      const apiError = error as any;
      return (
        apiError?.message || apiError?.response?.data?.message || defaultMessage
      );
    }
    return defaultMessage;
  };

  const steps = [
    "Basic Information",
    "Media & Description",
    "Text Fields",
    "Images & Status",
    "Documents",
    "Categories & Sub-Categories",
  ];

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
      status: "Active", // ADDED DEFAULT STATUS
      cvr: 0,
      businessUnit: 1,
      categoryId: 0,
      userId: 2,
      businessName: "",
      email: "",
      mobileNo: "",
      address: "",
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [{ documentName: "", documentUrl: "", isActive: true }],
    },
  });

  const {
    fields: subCategoryFields,
    append: appendSubCategory,
    remove: removeSubCategory,
  } = useFieldArray({
    control,
    name: "parSubCatlst",
  });

  const handleDocumentPreview = (url: string, name?: string) => {
    setPreviewDocument({
      url,
      name: name || url.split("/").pop() || "Document",
      isOpen: true,
    });
  };

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "parDoclst",
  });

  const logoUrlValue = watch("logoUrl");
  const videoUrlValue = watch("videoUrl");
  const imageUrl1Value = watch("imageUrl1");
  const imageUrl2Value = watch("imageUrl2");
  const imageUrl3Value = watch("imageUrl3");
  const imageUrl4Value = watch("imageUrl4");
  const imageUrl5Value = watch("imageUrl5");
  const thumbnailValue = watch("thumbnail");
  const categoryIdValue = watch("categoryId");

  // Check if a step is completed
  const isStepCompleted = async (step: number): Promise<boolean> => {
    const stepFields: Record<number, ValidFieldNames[]> = {
      1: [
        "businessName",
        "email",
        "mobileNo",
        "businessUnit",
        "cvr",
        "address",
      ],
      2: ["videoUrl", "logoUrl", "descriptionShort"],
      3: ["textField1", "textField2", "textField3", "textField4", "textField5"],
      4: [
        "imageUrl1",
        "imageUrl2",
        "imageUrl3",
        "imageUrl4",
        "imageUrl5",
        "isActive",
        "status", // ADDED STATUS TO STEP 4
      ],
      5: [],
      6: ["categoryId"],
    };

    // For steps 5 and 6, we need to check array fields
    if (step === 5) {
      const documentValidations = documentFields.map((_, index) =>
        trigger([
          `parDoclst.${index}.documentName`,
          `parDoclst.${index}.documentUrl`,
          `parDoclst.${index}.isActive`,
        ] as any)
      );
      const documentResults = await Promise.all(documentValidations);
      return documentResults.every((result) => result);
    }

    if (step === 6) {
      const categoryValid = await trigger("categoryId", { shouldFocus: false });
      const subCategoryValidations = subCategoryFields.map((_, index) =>
        trigger([
          `parSubCatlst.${index}.subCategoryId`,
          `parSubCatlst.${index}.isActive`,
        ] as any)
      );
      const subCategoryResults = await Promise.all(subCategoryValidations);
      return categoryValid && subCategoryResults.every((result) => result);
    }

    // For regular steps
    if (stepFields[step].length > 0) {
      return await trigger(stepFields[step] as any, { shouldFocus: false });
    }

    return true;
  };

  // Add this function to handle document changes and auto-save
  const handleDocumentChange = async (
    field: "documentName" | "documentUrl",
    value: string,
    index: number
  ) => {
    // Update the form value
    if (field === "documentName") {
      setValue(`parDoclst.${index}.documentName`, value);
    } else {
      setValue(`parDoclst.${index}.documentUrl`, value);
    }

    // If we're editing an existing partner and both fields have values, auto-save
    if (editingPartner?.id) {
      const currentDocument = watch(`parDoclst.${index}`);
      const documentName =
        field === "documentName" ? value : currentDocument.documentName;
      const documentUrl =
        field === "documentUrl" ? value : currentDocument.documentUrl;

      // Only save if both fields are filled
      if (
        documentName &&
        documentName.trim() !== "" &&
        documentUrl &&
        documentUrl.trim() !== ""
      ) {
        // Debounce the save to avoid too many API calls
        const timeoutId = setTimeout(() => {
          handleDocumentSave(
            {
              id: currentDocument.id || 0,
              partnerId: editingPartner.id!,
              documentName: documentName.trim(),
              documentUrl: documentUrl.trim(),
              isActive: currentDocument.isActive ?? true,
            },
            index
          );
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
      }
    }
  };

  // Update the handleDocumentSave function
  const handleDocumentSave = async (
    documentData: PartnerDocumentDto,
    index: number
  ) => {
    if (!editingPartner?.id) {
      toast.error("Please save partner basic information first");
      return;
    }

    // Add to saving documents array to show loading state
    setSavingDocuments((prev) => [...prev, index]);

    try {
      const payload: PartnerDocumentDto = {
        ...documentData,
        partnerId: editingPartner.id,
        isActive: true,
      };

      let response;
      if (documentData.id && documentData.id > 0) {
        // Update existing document
        response = await partnerDocumentService.updateDocument(payload);
      } else {
        // Add new document
        response = await partnerDocumentService.addDocument(payload);
      }

      // FIX: Remove .data since response is directly ApiResponse<PartnerDocument>
      if (response.isSuccess) {
        toast.success(
          `Document "${documentData.documentName}" saved successfully`
        );

        // Update the local form state with the returned document (which includes the ID)
        if (response.output) {
          setValue(`parDoclst.${index}`, {
            ...documentData,
            id: response.output.id,
            partnerId: editingPartner.id,
            isActive: true,
          });
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        queryClient.invalidateQueries({
          queryKey: ["partner", editingPartner.id],
        });
      } else {
        throw new Error(response.errorMessage || "Failed to save document");
      }
    } catch (error: any) {
      console.error("Document save error:", error);
      toast.error(`Failed to save document: ${error.message}`);
    } finally {
      // Remove from saving documents array
      setSavingDocuments((prev) => prev.filter((i) => i !== index));
    }
  };

  // Update completed steps when current step changes
  useEffect(() => {
    const updateCompletedSteps = async () => {
      const newCompletedSteps = [...completedSteps];

      // Check all previous steps
      for (let step = 1; step < currentStep; step++) {
        if (!newCompletedSteps.includes(step)) {
          const isValid = await isStepCompleted(step);
          if (isValid && !newCompletedSteps.includes(step)) {
            newCompletedSteps.push(step);
          }
        }
      }

      setCompletedSteps(newCompletedSteps);
    };

    if (currentStep > 1) {
      updateCompletedSteps();
    }
  }, [currentStep]);

  // UPDATED: Fetch partners with status filter
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: [
      "partners",
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
    ],
    queryFn: () =>
      partnerService.getPaginated({
        page: currentPage,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter === "All" ? "All" : statusFilter, // ADDED STATUS FILTER
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

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  useEffect(() => {
    if (categoryIdValue && categoryIdValue > 0) {
      setSelectedCategoryId(categoryIdValue);
    }
  }, [categoryIdValue]);

  useEffect(() => {
    console.log("useEffect for editing partner triggered:", {
      editingPartner,
      showForm,
    });
    if (editingPartner && showForm) {
      const formData: PartnerFormData = {
        userId: editingPartner.userId || 2,
        categoryId: editingPartner.categoryId,
        address: editingPartner.address,
        businessName: editingPartner.businessName,
        email: editingPartner.email || "",
        mobileNo: editingPartner.mobileNo || "",
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
        thumbnail: editingPartner.thumbnail || "",
        isActive: editingPartner.isActive,
        status: editingPartner.status || "Active", // ADDED STATUS
        parSubCatlst:
          editingPartner.parSubCatlst && editingPartner.parSubCatlst.length > 0
            ? editingPartner.parSubCatlst.map((subCat) => ({
                id: subCat.id,
                partnerId: subCat.partnerId,
                subCategoryId: subCat.subCategoryId,
                isActive: subCat.isActive ?? true,
              }))
            : [{ subCategoryId: 0, isActive: true }],
        parDoclst:
          editingPartner.parDoclst && editingPartner.parDoclst.length > 0
            ? editingPartner.parDoclst.map((doc) => ({
                id: doc.id,
                partnerId: doc.partnerId,
                documentName: doc.documentName,
                documentUrl: doc.documentUrl,
                isActive: doc.isActive ?? true,
              }))
            : [{ documentName: "", documentUrl: "", isActive: true }],
      };
      reset(formData);
      setSelectedCategoryId(editingPartner.categoryId);

      // Mark all steps as completed for editing mode
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
    } else if (!showForm) {
      resetForm();
    }
  }, [editingPartner, showForm, reset]);

  const resetForm = () => {
    const defaultValues: PartnerFormData = {
      userId: 2,
      categoryId: 0,
      address: "",
      businessUnit: 1,
      businessName: "",
      email: "",
      mobileNo: "",
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
      thumbnail: "",
      isActive: true,
      status: "Active", // ADDED DEFAULT STATUS
      parSubCatlst: [{ subCategoryId: 0, isActive: true }],
      parDoclst: [{ documentName: "", documentUrl: "", isActive: true }],
    };
    reset(defaultValues);
    setCurrentStep(1);
    setEditingPartner(null);
    setSelectedCategoryId(0);
    setCompletedSteps([]);
    setSavingDocuments([]); // Clear saving state
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
    onError: (error: any) => {
      console.error("Create partner error:", error);

      // Extract the actual error message from the API response
      const apiError = error?.response?.data;
      const errorMessage =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        error?.message ||
        t("admin.partners.createError") ||
        "Failed to create partner";

      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: partnerService.update,
    onSuccess: (variables) => {
      console.log("Update mutation called with variables:", variables);
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
      toast.success(
        t("admin.partners.updateSuccess") || "Partner updated successfully"
      );
      if (currentStep === steps.length) {
        handleFormClose();
      }
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error);

      // Extract the actual error message from the API response
      const apiError = error?.response?.data;
      const errorMessage =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        error?.message ||
        t("admin.partners.updateError") ||
        "Failed to update partner";

      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => partnerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"], exact: false });
      toast.success(
        t("admin.partners.deleteSuccess") || "Partner deleted successfully"
      );
      setDeleteConfirmation({ isOpen: false, partner: null }); // Close modal on success
    },
    onError: () => {
      toast.error(
        t("admin.partners.deleteError") || "Failed to delete partner"
      );
      setDeleteConfirmation({ isOpen: false, partner: null }); // Close modal on error
    },
  });

  // Password reset form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watchPassword("newPassword");

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { partner: Partner; newPassword: string }) => {
      const response = await userService.resetUserPassword({
        email: data.partner.email,
        newPassword: data.newPassword,
      });

      if (response === true) {
        return response;
      } else {
        throw new Error("Password reset failed");
      }
    },
    onSuccess: (response, variables) => {
      console.log("Password reset response:", response);
      toast.success(
        `Password reset successfully for ${variables.partner.businessName}`
      );
      setIsPasswordModalOpen(false);
      resetPassword();
      setResettingPartner(null);
    },
    onError: (error: any, variables) => {
      console.error("Reset password error:", error);
      if (error?.response?.data !== undefined) {
        toast.error(
          `Password reset failed for ${variables.partner.businessName}`
        );
      } else {
        toast.error(
          `Failed to reset password for ${variables.partner.businessName}: ${error.message}`
        );
      }
    },
  });

  // UPDATED: Export function with status filter
  const handleExportPartners = async () => {
    try {
      setIsExporting(true);
      const exportParams: Record<string, any> = {
        includeIsActive: true,
      };
      if (debouncedSearchTerm) {
        exportParams.searchTerm = debouncedSearchTerm;
      }
      // ADDED STATUS FILTER FOR EXPORT
      if (statusFilter !== "All") {
        exportParams.status = statusFilter === "Active" ? "Active" : "InActive";
      } else {
        exportParams.status = "All";
      }
      console.log("Exporting partners with params:", exportParams);
      await exportToExcel("Partner", exportParams);
      toast.success("Partners exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = getErrorMessage(error, "Failed to export partners");
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Modified onSubmit to handle both create and update
  const onSubmit = async (data: PartnerFormData) => {
    if (isSubmitting) return;

    console.log("Form submission triggered with data:", data);

    const isValid = await trigger();
    if (!isValid) {
      console.log("Form validation failed:", errors);
      toast.error("Please fix form errors before submitting");
      return;
    }

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
        isActive: true,
      }));

      const payload = {
        ...data,
        id: editingPartner?.id,
        parSubCatlst: subCategoriesPayload,
        parDoclst: documentsPayload,
        email: data.email || undefined,
        mobileNo: data.mobileNo || undefined,
      };

      console.log(
        "Final payload being sent:",
        JSON.stringify(payload, null, 2)
      );
      console.log(
        "Documents payload structure:",
        documentsPayload.map((doc) => Object.keys(doc))
      );

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

  // Unified handleNext function for both create and update modes
  const handleNext = async () => {
    if (isSubmitting) return;

    let isValid = true;

    const stepFields: Record<number, ValidFieldNames[]> = {
      1: [
        "businessName",
        "email",
        "mobileNo",
        "businessUnit",
        "cvr",
        "address",
      ],
      2: ["videoUrl", "logoUrl", "descriptionShort"],
      3: ["textField1", "textField2", "textField3", "textField4", "textField5"],
      4: [
        "imageUrl1",
        "imageUrl2",
        "imageUrl3",
        "imageUrl4",
        "imageUrl5",
        "isActive",
        "status", // ADDED STATUS TO STEP 4
      ],
      5: [],
      6: ["categoryId"],
    };

    // Validate current step fields
    if (stepFields[currentStep].length > 0) {
      isValid = await trigger(stepFields[currentStep] as any, {
        shouldFocus: true,
      });
    }

    // Additional validation for array fields in steps 5 and 6
    if (currentStep === 5) {
      const documentValidations = documentFields.map((_, index) =>
        trigger([
          `parDoclst.${index}.documentName`,
          `parDoclst.${index}.documentUrl`,
          `parDoclst.${index}.isActive`,
        ] as any)
      );
      const documentResults = await Promise.all(documentValidations);
      isValid = isValid && documentResults.every((result) => result);
    }

    if (currentStep === 6) {
      const categoryValid = await trigger("categoryId", { shouldFocus: true });
      isValid = isValid && categoryValid;

      const subCategoryValidations = subCategoryFields.map((_, index) =>
        trigger([
          `parSubCatlst.${index}.subCategoryId`,
          `parSubCatlst.${index}.isActive`,
        ] as any)
      );
      const subCategoryResults = await Promise.all(subCategoryValidations);
      isValid = isValid && subCategoryResults.every((result) => result);
    }

    if (!isValid) {
      console.log("Validation errors:", errors);
      toast.error("Please fix all form errors in this step before proceeding");
      return;
    }

    // In update mode, submit the current step before moving to next
    if (editingPartner && currentStep < steps.length) {
      setIsSubmitting(true);
      try {
        const data = watch();
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

        await updateMutation.mutateAsync(payload as any);
        toast.success(`Step ${currentStep} updated successfully`);

        // Move to next step after successful update
        setCurrentStep((prev) => prev + 1);
      } catch (error) {
        console.error("Step update error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < steps.length) {
      // In create mode, just move to next step
      setCurrentStep((prev) => prev + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // New function to handle step click
  const handleStepClick = async (step: number) => {
    if (isSubmitting) return;

    // In update mode, allow free navigation between steps
    if (editingPartner) {
      setCurrentStep(step);
      return;
    }

    // For create mode, use original logic
    if (step < currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      await handleNext();
    } else if (step > currentStep) {
      let canNavigate = true;

      for (let i = currentStep; i < step; i++) {
        const isValid = await isStepCompleted(i);
        if (!isValid) {
          canNavigate = false;
          toast.error(
            `Please complete step ${i} before proceeding to step ${step}`
          );
          break;
        }
      }

      if (canNavigate) {
        setCurrentStep(step);
        const newCompletedSteps = [...completedSteps];
        for (let i = currentStep; i < step; i++) {
          if (!newCompletedSteps.includes(i)) {
            newCompletedSteps.push(i);
          }
        }
        setCompletedSteps(newCompletedSteps);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // UPDATED: Status filter change handler
  const handleStatusFilterChange = (filter: "All" | "Active" | "InActive") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleResetPassword = (partner: Partner) => {
    setResettingPartner(partner);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setResettingPartner(null);
    resetPassword();
  };

  const onSubmitPasswordReset = async (data: PasswordResetData) => {
    if (!resettingPartner) return;

    resetPasswordMutation.mutate({
      partner: resettingPartner,
      newPassword: data.newPassword,
    });
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

    // Show delete confirmation modal
    setDeleteConfirmation({
      isOpen: true,
      partner: partner,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.partner?.id) {
      deleteMutation.mutate(deleteConfirmation.partner.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, partner: null });
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

  const handleCategoryChange = (categoryId: number | string) => {
    console.log("Category changed to:", categoryId);
    const categoryIdNum =
      typeof categoryId === "string" ? parseInt(categoryId, 10) : categoryId;

    setSelectedCategoryId(categoryIdNum);

    if (subCategoryFields.length > 0) {
      subCategoryFields.forEach((_, index) => {
        setValue(`parSubCatlst.${index}.subCategoryId`, 0);
        setValue(`parSubCatlst.${index}.isActive`, true);
      });
    }
  };

  // Get data from API response
  const partners = paginatedData?.output?.result || [];
  const totalItems = paginatedData?.output?.rowCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // UPDATED: Check if there are any records to display
  const hasRecords = partners.length > 0;

  // UPDATED: Columns with status field
  const columns: ColumnDef<Partner>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "businessName", header: "Business Name" },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => getCategoryName(row.original.categoryId),
    },
    {
      accessorKey: "subCategories",
      header: "Sub Categories",
      cell: ({ row }) => {
        const subCategories = row.original.parSubCatlst;

        if (!subCategories || subCategories.length === 0) {
          return <span className="text-gray-400">No subcategories</span>;
        }

        // Get unique subcategory names
        const uniqueSubCategories = Array.from(
          new Set(
            subCategories
              .filter((subCat) => subCat.subCategories)
              .map((subCat) => subCat.subCategories)
          )
        );

        if (uniqueSubCategories.length === 0) {
          return <span className="text-gray-400">No subcategories</span>;
        }

        return (
          <div className="max-w-xs">
            {uniqueSubCategories.map((subCatName, index) => (
              <span
                key={index}
                className="inline-block text-black text-xs px-2 py-1  mr-1 mb-1"
              >
                {subCatName}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.address;
        if (!address) return "-";

        return address.length > 50 ? `${address.substring(0, 50)}...` : address;
      },
    },
    { accessorKey: "cvr", header: "CVR" },
    { accessorKey: "mobileNo", header: "Mobile Number" },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="px-2 py-1 rounded-full text-xs text-white font-medium"
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
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit partner"
          >
            <IconPencil />
          </button>
          <button
            onClick={() => handleResetPassword(row.original)}
            disabled={showForm || resetPasswordMutation.isPending}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset Password"
          >
            <IconKey />
          </button>
          <button
            onClick={() => handleDeletePartner(row.original)}
            disabled={showForm}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Delete partner"
          >
            <IconTrash />
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
                {...register("mobileNo")}
                placeholder="Enter mobile number"
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
            <h3 className="text-lg font-bold text-gray-900">
              Media & Description
            </h3>

            <div className="space-y-3">
              <ImageUpload
                label="Thumbnail Upload"
                value={thumbnailValue}
                onChange={(url) => setValue("thumbnail", url)}
                onPreview={handleImagePreview}
                folder="partners/thumbnails"
                error={errors.thumbnail?.message}
                exactDimensions={{ width: 1440, height: 710 }}
                showDimensionValidation={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <VideoUpload
                label=""
                value={videoUrlValue || ""}
                onChange={(url) => setValue("videoUrl", url)}
                onPreview={handleVideoPreview}
                folder="partners/videos"
                error={errors.videoUrl?.message}
              />

              <LogoUploadWithValidation
                label="Logo Upload"
                value={logoUrlValue || ""}
                onChange={(url) => setValue("logoUrl", url)}
                onPreview={handleImagePreview}
                error={errors.logoUrl?.message}
              />
            </div>

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
            <h3 className="text-lg font-bold text-gray-900">Images & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                label="Image Upload 1"
                value={imageUrl1Value}
                onChange={(url) => setValue("imageUrl1", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl1?.message}
                exactDimensions={{ width: 1440, height: 710 }}
                showDimensionValidation={true}
              />

              <ImageUpload
                label="Image Upload 2"
                value={imageUrl2Value}
                onChange={(url) => setValue("imageUrl2", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl2?.message}
                exactDimensions={{ width: 439, height: 468 }}
                showDimensionValidation={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                label="Image Upload 5"
                value={imageUrl5Value}
                onChange={(url) => setValue("imageUrl5", url)}
                onPreview={handleImagePreview}
                folder="partners/images"
                error={errors.imageUrl5?.message}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                Partner Documents
              </h4>
              {documentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
                >
                  <div className="space-y-4 mb-4">
                    <Input
                      label={`Document Name ${index + 1}`}
                      error={errors.parDoclst?.[index]?.documentName?.message}
                      value={watch(`parDoclst.${index}.documentName`)}
                      onChange={(e) =>
                        handleDocumentChange(
                          "documentName",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="Enter document name (e.g., Business License, Contract, Certificate)"
                      required
                      disabled={savingDocuments.includes(index)}
                    />

                    <DocumentUpload
                      label={`Document File ${index + 1}`}
                      value={watch(`parDoclst.${index}.documentUrl`)}
                      onChange={(url) => {
                        setValue(`parDoclst.${index}.documentUrl`, url);
                        handleDocumentChange("documentUrl", url, index);
                      }}
                      onPreview={(url) =>
                        handleDocumentPreview(
                          url,
                          watch(`parDoclst.${index}.documentName`)
                        )
                      }
                      folder="partners/documents"
                      error={errors.parDoclst?.[index]?.documentUrl?.message}
                    />

                    {/* Saving indicator */}
                    {savingDocuments.includes(index) && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Saving document...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {documentFields.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                          // If document has been saved to server, delete it
                          const documentId = watch(`parDoclst.${index}.id`);
                          if (editingPartner?.id && documentId) {
                            if (
                              confirm(
                                "Are you sure you want to delete this document?"
                              )
                            ) {
                              partnerDocumentService
                                .deleteDocument(documentId)
                                .then(() => {
                                  toast.success(
                                    "Document deleted successfully"
                                  );
                                  removeDocumentField(index);
                                  queryClient.invalidateQueries({
                                    queryKey: ["partners"],
                                  });
                                })
                                .catch((error) => {
                                  toast.error("Failed to delete document");
                                  console.error(
                                    "Delete document error:",
                                    error
                                  );
                                });
                            }
                          } else {
                            removeDocumentField(index);
                          }
                        }}
                        disabled={savingDocuments.includes(index)}
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
                style={{
                  backgroundColor: "#95C11F",
                  borderColor: "#95C11F",
                  color: "white",
                }}
                className="hover:bg-[#85B11F] hover:border-[#85B11F]"
              >
                Add Document +
              </Button>
              {errors.parDoclst && !errors.parDoclst.root && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.parDoclst.message}
                </p>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Categories & Sub Categories
            </h3>
            <div className="bg-[#F0F2EA] p-4 rounded-lg">
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
            {selectedCategoryId > 0 && (
              <div className="bg-[#F0F2EA] p-4 rounded-lg">
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
                      style={{
                        backgroundColor: "#95C11F",
                        borderColor: "#95C11F",
                        color: "white",
                      }}
                      className="hover:bg-[#85B11F] hover:border-[#85B11F]"
                    >
                      Add Sub Categories +
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

  const renderFormFooter = () => (
    <div className="flex justify-between pt-6 mt-4 border-t border-gray-200">
      <div>
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {currentStep < steps.length ? (
          <Button
            key="next"
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Next"}
          </Button>
        ) : (
          <Button
            key="submit"
            size="lg"
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
  );

  return (
    <div className="p-3">
      {/* Render Toast Banners */}
      {toasts.map((toastItem) => (
        <AdminToast
          key={toastItem.id}
          type={toastItem.type}
          message={toastItem.message}
          onClose={() => hideToast(toastItem.id)}
          autoDismissMs={5000}
        />
      ))}

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={
          deleteConfirmation.partner
            ? `Partner: ${deleteConfirmation.partner.businessName} (CVR: ${deleteConfirmation.partner.cvr})`
            : undefined
        }
        confirmationMessage={
          t("admin.partners.deleteConfirm") ||
          "Are you sure you want to delete this partner?"
        }
        isLoading={deleteMutation.isPending}
      />

      {!showForm && (
        <div className="p-2 mb-2">
          <div className="flex justify-between items-center">
            <div className="font-figtree">
              <Button
                variant="primary"
                size="md"
                onClick={handleAddPartner}
                disabled={showForm}
                icon={IconPlus}
                iconPosition="left"
                iconSize="w-5 h-5"
              >
                {t("admin.partners.addPartner")}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {/* UPDATED: Status Filter Dropdown */}
              <FilterDropdown
                value={statusFilter}
                onChange={handleStatusFilterChange}
              />

              <div className="w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>

              {/* UPDATED: Export Button with hasRecords check */}
              <Button
                variant="outline"
                size="md"
                onClick={handleExportPartners}
                disabled={isExporting || !hasRecords}
                icon={IconUpload}
                iconPosition="left"
                iconSize="w-5 h-5"
              >
                {isExporting
                  ? t("common.exporting") || "Exporting..."
                  : t("common.export") || "Export"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Updated header with back arrow */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleFormClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#165933] text-white"
              title="Go back"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPartner
                  ? t("admin.partners.editPartner")
                  : t("admin.partners.addPartner")}
              </h2>
            </div>
          </div>
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
          <form
            onSubmit={handleSubmit((data) => {
              console.log("Form submission triggered with data:", data);
              onSubmit(data); // Final submission without step parameter
            })}
          >
            <div className="px-1 mb-6">{renderStepContent()}</div>
            {renderFormFooter()}
          </form>
        </div>
      )}
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
            /* UPDATED: Data Table or No Records Message */
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {hasRecords ? (
                <>
                  <DataTable data={partners} columns={columns} />
                  {/* Only show pagination if there are records and more than one page */}
                  {hasRecords && totalPages > 1 && (
                    <div className="px-4 pb-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                /* No Records Found Message */
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <IconNoRecords className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("common.noRecordsFound") || "No records found"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {searchTerm || statusFilter !== "All"
                        ? "Try adjusting your search or filter criteria"
                        : "No partners have been created yet"}
                    </p>
                    {!searchTerm && statusFilter === "All" && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPartner}
                        icon={IconPlus}
                        iconPosition="left"
                        iconSize="w-5 h-5"
                      >
                        {t("admin.partners.addPartner") || "Add Partner"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <ImagePreviewModal
        imageUrl={previewImage.url}
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ url: "", isOpen: false })}
      />
      <VideoPreviewModal
        videoUrl={previewVideo.url}
        isOpen={previewVideo.isOpen}
        onClose={() => setPreviewVideo({ url: "", isOpen: false })}
      />
      <DocumentPreviewModal
        documentUrl={previewDocument.url}
        documentName={previewDocument.name}
        isOpen={previewDocument.isOpen}
        onClose={() => setPreviewDocument({ url: "", name: "", isOpen: false })}
      />
      {/* Password Reset Modal */}
      <Modal
        open={isPasswordModalOpen}
        title={t("admin.partners.resetPassword") || "Reset Password"}
        onClose={handlePasswordModalClose}
      >
        {resettingPartner && (
          <form
            onSubmit={handleSubmitPassword(onSubmitPasswordReset)}
            className="space-y-4"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Resetting password for:{" "}
                <strong>{resettingPartner.businessName}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {resettingPartner.email}
              </p>
            </div>

            <Input
              label="New Password"
              type="password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword("newPassword")}
              required
              placeholder="Enter new password"
            />

            <Input
              label="Confirm Password"
              type="password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword("confirmPassword")}
              required
              placeholder="Confirm new password"
            />

            {watchNewPassword && (
              <div
                className={`text-xs p-2 rounded ${
                  watchNewPassword.length >= 6
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                Password strength:{" "}
                {watchNewPassword.length >= 6 ? "Strong" : "Weak"}
                (min. 6 characters)
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePasswordModalClose}
                disabled={resetPasswordMutation.isPending}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={!isPasswordValid || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

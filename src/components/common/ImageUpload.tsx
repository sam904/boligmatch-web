// src/components/common/ImageUpload.tsx
import { useRef, useState } from "react";
import { uploadService } from "../../services/uploadS3.service";
import { toast } from "sonner";
import { ImageUp, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  label: React.ReactNode;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  onPreview?: (url: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  showDimensionValidation?: boolean;
  exactDimensions?: { width: number; height: number };
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder = "images",
  error,
  onPreview,
  maxWidth, // Remove default value
  maxHeight, // Remove default value
  showDimensionValidation = false,
  exactDimensions,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if file is SVG
  const isSVGFile = (file: File): boolean => {
    return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  };

  // Check if URL is SVG
  const isSVGUrl = (url: string): boolean => {
    return url.toLowerCase().endsWith(".svg");
  };

 // Update the validateImageDimensions function in ImageUpload.tsx
const validateImageDimensions = (
  file: File
): Promise<{ isValid: boolean; width: number; height: number }> => {
  return new Promise((resolve) => {
    // Remove SVG skip - we need to validate SVG dimensions too
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      let isValid = true;
      if (exactDimensions) {
        // Use exact dimensions validation when provided
        isValid =
          img.width === exactDimensions.width &&
          img.height === exactDimensions.height;
      } else if (maxWidth && maxHeight) {
        // Use max dimensions validation when provided
        isValid = img.width <= maxWidth && img.height <= maxHeight;
      } else {
        // If no dimension constraints, always valid
        isValid = true;
      }
      resolve({ isValid, width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      resolve({ isValid: false, width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
};

// Update the dimension validation logic in handleFileSelect
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type - now includes SVG
  const isImage = file.type.startsWith("image/");
  const isSVG = isSVGFile(file);
  
  if (!isImage && !isSVG) {
    toast.error(
      t("common.invalidImageFile") ||
        "Please select a valid image file (JPEG, PNG, SVG, etc.)"
    );
    return;
  }

  // Validate file size (increase limit for SVG files)
  const maxSize = isSVGFile(file) ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for SVG, 2MB for others
  if (file.size > maxSize) {
    const sizeLimit = isSVGFile(file) ? "5MB" : "2MB";
    toast.error(
      t("common.fileSizeExceeded") || `File size should be less than ${sizeLimit}`
    );
    return;
  }

  // Validate dimensions when required - NOW INCLUDES SVG FILES
  if (showDimensionValidation && (exactDimensions || (maxWidth && maxHeight))) {
    setValidating(true);
    try {
      const { isValid, width, height } = await validateImageDimensions(file);
      if (!isValid) {
        const currentDimensions =
          t("common.currentDimensions", { width, height }) ||
          `Current: ${width}x${height}px`;

        if (exactDimensions) {
          const errorMessage =
            t("validation.imageDimensionsExact", {
              width: exactDimensions.width,
              height: exactDimensions.height,
              current: currentDimensions,
            }) ||
            `Image must be exactly ${exactDimensions.width}x${exactDimensions.height}px. ${currentDimensions}`;
          toast.error(errorMessage);
          
          // Clear any existing errors and set new error
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          // Return early - don't proceed with upload
          setValidating(false);
          return;
        } else if (maxWidth && maxHeight) {
          const errorMessage =
            t("validation.imageDimensionsMax", {
              width: maxWidth,
              height: maxHeight,
              current: currentDimensions,
            }) ||
            `Image must be ${maxWidth}x${maxHeight}px or smaller. ${currentDimensions}`;
          toast.error(errorMessage);
          
          if (fileInputRef.current) fileInputRef.current.value = "";
          setValidating(false);
          return;
        }
      }
      toast.success(
        t("common.dimensionsOK", { width, height }) ||
          `Image dimensions OK (${width}x${height}px)`
      );
    } catch (error) {
      toast.error(
        t("common.dimensionValidationFailed") ||
          "Failed to validate image dimensions"
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setValidating(false);
      return;
    } finally {
      setValidating(false);
    }
  }

  // Upload the file
  setUploading(true);
  try {
    const url = await uploadService.uploadImage(file, folder);
    onChange(url);
    toast.success(
      isSVGFile(file) 
        ? t("common.svgUploadSuccess") || "SVG uploaded successfully"
        : t("common.uploadSuccess") || "Image uploaded successfully"
    );
  } catch (error) {
    console.error("File upload error:", error);
    toast.error(
      isSVGFile(file)
        ? t("common.svgUploadFailed") || "Failed to upload SVG"
        : t("common.uploadFailed") || "Failed to upload image"
    );
  } finally {
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

  const getDimensionMessage = () => {
    if (exactDimensions) {
      return (
        t("common.exactlyPixels", {
          width: exactDimensions.width,
          height: exactDimensions.height,
        }) ||
        `exactly ${exactDimensions.width}x${exactDimensions.height} pixels`
      );
    } else if (maxWidth && maxHeight) {
      return (
        t("common.maxPixels", {
          width: maxWidth,
          height: maxHeight,
        }) || `max ${maxWidth}x${maxHeight} pixels`
      );
    }
    return t("common.noDimensionRestrictions") || "No dimension restrictions";
  };

  // const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // Validate file type - now includes SVG
  //   const isImage = file.type.startsWith("image/");
  //   const isSVG = isSVGFile(file);
    
  //   if (!isImage && !isSVG) {
  //     toast.error(
  //       t("common.invalidImageFile") ||
  //         "Please select a valid image file (JPEG, PNG, SVG, etc.)"
  //     );
  //     return;
  //   }

  //   // Validate file size (increase limit for SVG files)
  //   const maxSize = isSVGFile(file) ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for SVG, 2MB for others
  //   if (file.size > maxSize) {
  //     const sizeLimit = isSVGFile(file) ? "5MB" : "2MB";
  //     toast.error(
  //       t("common.fileSizeExceeded") || `File size should be less than ${sizeLimit}`
  //     );
  //     return;
  //   }

  //   // Validate dimensions for non-SVG files when required
  //   if (showDimensionValidation && !isSVGFile(file) && (exactDimensions || (maxWidth && maxHeight))) {
  //     setValidating(true);
  //     try {
  //       const { isValid, width, height } = await validateImageDimensions(file);
  //       if (!isValid) {
  //         const currentDimensions =
  //           t("common.currentDimensions", { width, height }) ||
  //           `Current: ${width}x${height}px`;

  //         if (exactDimensions) {
  //           const errorMessage =
  //             t("validation.imageDimensionsExact", {
  //               width: exactDimensions.width,
  //               height: exactDimensions.height,
  //               current: currentDimensions,
  //             }) ||
  //             `Image must be exactly ${exactDimensions.width}x${exactDimensions.height}px. ${currentDimensions}`;
  //           toast.error(errorMessage);
  //         } else if (maxWidth && maxHeight) {
  //           const errorMessage =
  //             t("validation.imageDimensionsMax", {
  //               width: maxWidth,
  //               height: maxHeight,
  //               current: currentDimensions,
  //             }) ||
  //             `Image must be ${maxWidth}x${maxHeight}px or smaller. ${currentDimensions}`;
  //           toast.error(errorMessage);
  //         }
  //         if (fileInputRef.current) fileInputRef.current.value = "";
  //         return;
  //       }
  //       toast.success(
  //         t("common.dimensionsOK", { width, height }) ||
  //           `Image dimensions OK (${width}x${height}px)`
  //       );
  //     } catch (error) {
  //       toast.error(
  //         t("common.dimensionValidationFailed") ||
  //           "Failed to validate image dimensions"
  //       );
  //       if (fileInputRef.current) fileInputRef.current.value = "";
  //       return;
  //     } finally {
  //       setValidating(false);
  //     }
  //   }

  //   // Upload the file
  //   setUploading(true);
  //   try {
  //     const url = await uploadService.uploadImage(file, folder);
  //     onChange(url);
  //     toast.success(
  //       isSVGFile(file) 
  //         ? t("common.svgUploadSuccess") || "SVG uploaded successfully"
  //         : t("common.uploadSuccess") || "Image uploaded successfully"
  //     );
  //   } catch (error) {
  //     console.error("File upload error:", error);
  //     toast.error(
  //       isSVGFile(file)
  //         ? t("common.svgUploadFailed") || "Failed to upload SVG"
  //         : t("common.uploadFailed") || "Failed to upload image"
  //     );
  //   } finally {
  //     setUploading(false);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   }
  // };

  const handleClick = () => {
    if (!uploading && !validating) {
      fileInputRef.current?.click();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value && onPreview) {
      onPreview(value);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(
        url.split("/").pop() || t("common.imageFile") || "Image"
      );
    } catch {
      return t("common.imageFile") || "Image";
    }
  };

  const getFileTypeText = (url: string) => {
    if (isSVGUrl(url)) return t("imageTypes.svgImage") || "SVG Image";
    if (url.includes(".png")) return t("imageTypes.pngImage") || "PNG Image";
    if (url.includes(".jpg") || url.includes(".jpeg"))
      return t("imageTypes.jpegImage") || "JPEG Image";
    if (url.includes(".gif")) return t("imageTypes.gifImage") || "GIF Image";
    if (url.includes(".webp")) return t("imageTypes.webpImage") || "WebP Image";
    return t("common.imageFile") || "Image File";
  };

  const renderPreview = (url: string, size: "small" | "large" = "large") => {
    const isSVG = isSVGUrl(url);
    const sizeClass = size === "large" ? "w-20 h-20" : "w-16 h-16";
    
    if (isSVG) {
      return (
        <div className={`${sizeClass} bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center p-2 cursor-pointer`}>
          <div className="text-[#91C73D] font-semibold text-xs mb-1">SVG</div>
          <div className="text-xs text-gray-400 text-center">Vector Graphic</div>
        </div>
      );
    } else {
      return (
        <img
          src={url}
          alt="Uploaded preview"
          className={`${sizeClass} object-cover rounded-lg border border-gray-300 cursor-pointer`}
        />
      );
    }
  };

  const isProcessing = uploading || validating;
  
  // Determine if we should show dimension validation message
  const shouldShowDimensionMessage = showDimensionValidation && !isSVGUrl(value || "");

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {shouldShowDimensionMessage && (
          <span className="text-sm text-gray-500 ml-2">
            ({getDimensionMessage()})
          </span>
        )}
        {isSVGUrl(value || "") && (
          <span className="text-sm text-green-600 ml-2">
            ({t("common.svgFile") || "SVG File"})
          </span>
        )}
      </label>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`
          relative w-full border-2 border-dashed rounded-lg cursor-pointer
          transition-all py-3 duration-200 ease-in-out
          ${
            uploading || validating
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-[#91C73D] hover:bg-gray-50"
          }
          ${error ? "border-red-300 bg-red-50" : "border-gray-300"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm">
              {uploading
                ? t("common.uploading") || "Uploading..."
                : t("common.validating") || "Validating..."}
            </p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-3 text-center py-1">
            <div className="cursor-pointer" onClick={handleImageClick}>
              {renderPreview(value, "large")}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getFileTypeText(value)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <ImageUp className="w-6 h-6 text-[#91C73D] mb-2" />
            <p className="text-sm text-[#91C73D] font-medium">
              {t("common.clickToUpload") || "Click to upload image"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("common.supportedFormats") || "PNG, JPG, JPEG, WebP, SVG"}
              {showDimensionValidation && ` • ${getDimensionMessage()}`}
            </p>
          </div>
        )}
      </div>

      {/* File Preview Section */}
      {value && !isProcessing && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            {/* Thumbnail - Clickable */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={handleImageClick}
            >
              {renderPreview(value, "small")}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {getFileTypeText(value)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}

// src/components/common/ImageUpload.tsx
import { useRef, useState } from "react";
import { uploadService } from "../../services/uploadS3.service";
import { toast } from "sonner";
import { ImageUp, Loader2 } from "lucide-react";

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
  maxWidth = 512,
  maxHeight = 512,
  showDimensionValidation = false,
  exactDimensions,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageDimensions = (
    file: File
  ): Promise<{ isValid: boolean; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        let isValid = true;
        if (exactDimensions) {
          isValid =
            img.width === exactDimensions.width &&
            img.height === exactDimensions.height;
        } else {
          isValid = img.width <= maxWidth && img.height <= maxHeight;
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

  const getDimensionMessage = () => {
    if (exactDimensions) {
      return `exactly ${exactDimensions.width}x${exactDimensions.height} pixels`;
    } else {
      return `max ${maxWidth}x${maxHeight} pixels`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Validate dimensions if required
    if (showDimensionValidation) {
      setValidating(true);
      try {
        const { isValid, width, height } = await validateImageDimensions(file);
        if (!isValid) {
          if (exactDimensions) {
            toast.error(
              `Image must be exactly ${exactDimensions.width}x${exactDimensions.height}px. Current: ${width}x${height}px`
            );
          } else {
            toast.error(
              `Image must be ${maxWidth}x${maxHeight}px or smaller. Current: ${width}x${height}px`
            );
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        toast.success(`Image dimensions OK (${width}x${height}px)`);
      } catch (error) {
        toast.error("Failed to validate image dimensions");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      } finally {
        setValidating(false);
      }
    }

    // Upload the image
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, folder);
      onChange(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      return decodeURIComponent(url.split("/").pop() || "Image");
    } catch {
      return "Image";
    }
  };

  const getImageTypeText = (url: string) => {
    if (url.includes(".png")) return "PNG Image";
    if (url.includes(".jpg") || url.includes(".jpeg")) return "JPEG Image";
    if (url.includes(".gif")) return "GIF Image";
    if (url.includes(".webp")) return "WebP Image";
    return "Image File";
  };

  const isProcessing = uploading || validating;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm text-gray-500 mb-2">
        {label}
        {showDimensionValidation && (
          <span className="text-sm text-gray-500 ml-2">
            ({getDimensionMessage()})
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
            uploading
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-[#91C73D] hover:bg-gray-50"
          }
          ${error ? "border-red-300" : "border-gray-300"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm">
              {uploading ? "Uploading..." : "Validating..."}
            </p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-3 text-center py-1">
            <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getImageTypeText(value)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <ImageUp className="w-6 h-6 text-[#91C73D] mb-1" />
            <p className="text-sm text-[#91C73D] font-medium">
              Click to upload image
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, JPEG, WebP
              {showDimensionValidation && ` • ${getDimensionMessage()}`}
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {value && !isProcessing && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            {/* Image Thumbnail - Clickable */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={handleImageClick}
            >
              <div className="w-16 h-16 bg-white rounded border flex items-center justify-center overflow-hidden">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Image Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {getFileNameFromUrl(value)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {getImageTypeText(value)}
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

// src/components/common/ImageUpload.tsx
import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadS3.service';
import { toast } from 'sonner';
import { ImageUp } from 'lucide-react';

interface ImageUploadProps {
  label: string;
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
  folder = 'images',
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

  const validateImageDimensions = (file: File): Promise<{ isValid: boolean; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        let isValid = true;
        if (exactDimensions) {
          isValid = img.width === exactDimensions.width && img.height === exactDimensions.height;
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
      return `${maxWidth}x${maxHeight} pixels or smaller`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    if (showDimensionValidation) {
      setValidating(true);
      try {
        const { isValid, width, height } = await validateImageDimensions(file);
        if (!isValid) {
          if (exactDimensions) {
            toast.error(`Image must be exactly ${exactDimensions.width}x${exactDimensions.height}px. Current: ${width}x${height}`);
          } else {
            toast.error(`Image must be ${maxWidth}x${maxHeight}px or smaller. Current: ${width}x${height}`);
          }
          fileInputRef.current && (fileInputRef.current.value = '');
          return;
        }
        toast.success(`Image dimensions OK (${width}x${height})`);
      } catch {
        toast.error('Failed to validate image dimensions');
        fileInputRef.current && (fileInputRef.current.value = '');
        return;
      } finally {
        setValidating(false);
      }
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, folder);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handlePreview = () => {
    if (value && onPreview) onPreview(value);
  };

  const handleRemove = () => {
    onChange('');
  };

  const isUploading = uploading || validating;

  return (
    <div className="w-full">
      {/* Section Label */}
      <label className="block text-base font-semibold text-gray-900 mb-2">
        {label}
      </label>

      {showDimensionValidation && (
        <p className="text-sm text-gray-500 mb-2">
          Upload Image <span className="text-gray-400">(Max: {getDimensionMessage()})</span>
        </p>
      )}

      {/* Upload Box */}
      <div
        onClick={handleClick}
        className={`w-full border-2 border-dashed rounded-md cursor-pointer flex flex-col items-center justify-center py-10 transition
          ${isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#91C73D] hover:bg-gray-50'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg
              className="w-6 h-6 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 
                0 5.373 0 12h4zm2 
                5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm">Uploading...</p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-40 h-24 border border-gray-300 rounded-md overflow-hidden">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onClick={handlePreview}
              />
            </div>
            <p className="text-xs text-gray-600 break-all max-w-[300px]">{value}</p>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={handlePreview}
                className="text-blue-600 text-xs underline"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-600 text-xs underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <ImageUp className="w-6 h-6 text-[#91C73D] mb-1" />
            <p className="text-sm text-[#91C73D] font-medium">
              Click to upload
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}

// src/components/common/ImageUpload.tsx
import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadS3.service';
import { toast } from 'sonner';
import { ImageUp, Eye, Trash2, Loader2 } from 'lucide-react';

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
      return `max ${maxWidth}x${maxHeight} pixels`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Validate dimensions if required
    if (showDimensionValidation) {
      setValidating(true);
      try {
        const { isValid, width, height } = await validateImageDimensions(file);
        if (!isValid) {
          if (exactDimensions) {
            toast.error(`Image must be exactly ${exactDimensions.width}x${exactDimensions.height}px. Current: ${width}x${height}px`);
          } else {
            toast.error(`Image must be ${maxWidth}x${maxHeight}px or smaller. Current: ${width}x${height}px`);
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        toast.success(`Image dimensions OK (${width}x${height}px)`);
      } catch (error) {
        toast.error('Failed to validate image dimensions');
        if (fileInputRef.current) fileInputRef.current.value = '';
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
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!uploading && !validating) {
      fileInputRef.current?.click();
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value && onPreview) {
      onPreview(value);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    toast.info('Image removed');
  };

  const isProcessing = uploading || validating;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {showDimensionValidation && (
          <span className="text-xs text-gray-500 ml-2">
            ({getDimensionMessage()})
          </span>
        )}
      </label>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`
          relative w-full border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${isProcessing 
            ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-300' 
            : value 
              ? 'border-green-200 bg-green-50 hover:border-green-300' 
              : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
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

        <div className="flex flex-col items-center justify-center p-6">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Validating...'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please wait...
                </p>
              </div>
            </div>
          ) : value ? (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Image Preview */}
              <div className="relative group">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
              
              {/* File Info */}
              <div className="text-center">
                <p className="text-xs text-gray-500 break-all max-w-xs">
                  {value.split('/').pop()}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✓ Image uploaded successfully
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <ImageUp className="w-10 h-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 2MB
                  {showDimensionValidation && ` • ${getDimensionMessage()}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
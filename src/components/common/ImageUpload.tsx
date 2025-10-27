// src/components/common/ImageUpload.tsx
import { useRef, useState } from 'react';
import { uploadService } from '../../services/uploadS3.service';
import Button from './Button';
import { toast } from 'sonner';

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
  exactDimensions?: { width: number; height: number }; // For exact dimension requirements
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
  exactDimensions // Optional: for exact dimension requirements
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to validate image dimensions
  const validateImageDimensions = (file: File): Promise<{isValid: boolean; width: number; height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        let isValid = true;
        
        if (exactDimensions) {
          // Check for exact dimensions
          isValid = img.width === exactDimensions.width && img.height === exactDimensions.height;
        } else {
          // Check for maximum dimensions
          isValid = img.width <= maxWidth && img.height <= maxHeight;
        }
        
        resolve({
          isValid,
          width: img.width,
          height: img.height
        });
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

    const maxSize = 2 * 1024 * 1024; // 2 MB in bytes
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
            toast.error(`Image dimensions must be exactly ${exactDimensions.width}x${exactDimensions.height} pixels. Current dimensions: ${width}x${height}`);
          } else {
            toast.error(`Image dimensions must be ${maxWidth}x${maxHeight} pixels or smaller. Current dimensions: ${width}x${height}`);
          }
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        
        // Show dimension success message
        if (exactDimensions) {
          toast.success(`Perfect! Image is exactly ${width}x${height} pixels`);
        } else {
          if (width === maxWidth && height === maxHeight) {
            toast.success(`Perfect! Image is ${maxWidth}x${maxHeight} pixels`);
          } else {
            toast.success(`Image dimensions are acceptable (${width}x${height})`);
          }
        }
      } catch (error) {
        toast.error('Failed to validate image dimensions');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const handlePreview = () => {
    if (value && onPreview) {
      onPreview(value);
    }
  };

  const isUploading = uploading || validating;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {showDimensionValidation && (
          <span className="text-xs text-gray-500 ml-1">
            ({getDimensionMessage()})
          </span>
        )}
      </label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Field - Full width on mobile, flexible on desktop */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="upload image"
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20 focus:outline-none pr-10"
            />
            {/* Clear button inside input */}
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Clear Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Upload Button */}
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto min-w-[120px] h-full"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {validating ? 'Validating...' : 'Uploading...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            {/* Clickable Image Preview */}
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={handlePreview}
              title="Click to preview image"
            >
              <div className="w-16 h-16 bg-white rounded border overflow-hidden flex items-center justify-center">
                <img 
                  src={value} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Show fallback icon if image fails to load
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      `;
                    }
                  }}
                />
              </div>
            </div>
            
            {/* URL and Actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 break-all">{value}</p>
              <div className="flex gap-2 mt-2">
                {/* Preview and Remove buttons commented out as per original */}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
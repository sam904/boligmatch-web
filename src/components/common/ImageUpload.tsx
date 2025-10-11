import { useRef, useState } from 'react';
import { uploadService } from '../../services/upload.service';
import Button from './Button';
import { toast } from 'sonner';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
}

export default function ImageUpload({ label, value, onChange, folder = 'images', error }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, folder);
      setPreview(url);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div className="flex items-start gap-4">
        {preview && (
          <div className="relative w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex-1">
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
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
          </Button>
          
          {value && !preview && (
            <p className="mt-2 text-sm text-gray-500 truncate">{value}</p>
          )}
        </div>
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

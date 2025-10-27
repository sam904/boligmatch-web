// services/uploadS3.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const SPACES_ACCESS_KEY = import.meta.env.VITE_DO_SPACES_ACCESS_KEY;
const SPACES_SECRET_KEY = import.meta.env.VITE_DO_SPACES_SECRET_KEY;

const s3Client = new S3Client({
  region: 'blr1',
  endpoint: 'https://blr1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: SPACES_ACCESS_KEY,
    secretAccessKey: SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

// Supported file types - ADD THESE ARRAYS
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/rtf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

function generateSafeFileName(originalName: string): string {
  // Extract filename without extension and extension separately
  const lastDotIndex = originalName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex !== -1 
    ? originalName.substring(0, lastDotIndex) 
    : originalName;
  const extension = lastDotIndex !== -1 
    ? originalName.substring(lastDotIndex + 1) 
    : '';

  // Clean the filename: remove special characters, replace spaces with hyphens
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  // If clean name is empty after cleaning, use 'file'
  const finalName = cleanName || 'file';
  
  return extension 
    ? `${finalName}-${timestamp}.${extension}`
    : `${finalName}-${timestamp}`;
}

function generateOriginalFileName(originalName: string): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex !== -1 
    ? originalName.substring(0, lastDotIndex) 
    : originalName;
  const extension = lastDotIndex !== -1 
    ? originalName.substring(lastDotIndex + 1) 
    : '';

  // Clean but preserve most of the original name
  const cleanName = nameWithoutExt
    .replace(/[^a-zA-Z0-9\s.-]/g, '') // Remove only special characters except dots and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  const timestamp = Date.now();
  const finalName = cleanName || 'file';
  
  return extension 
    ? `${finalName}-${timestamp}.${extension}`
    : `${finalName}-${timestamp}`;
}

export const uploadService = {
  async uploadImage(file: File, folder = 'images', preserveOriginalName = false): Promise<string> {
    try {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Unsupported image type: ${file.type}. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`);
      }

      const fileName = preserveOriginalName 
        ? generateOriginalFileName(file.name)
        : generateSafeFileName(file.name);
      
      const key = folder ? `${folder}/${fileName}` : fileName;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: 'boligmatch',
        Key: key,
        Body: uint8Array,
        ACL: 'public-read',
        ContentType: file.type,
        ContentLength: file.size,
      });

      await s3Client.send(command);

      return `https://boligmatch.blr1.digitaloceanspaces.com/${key}`;
    } catch (error) {
      console.error('Upload error details:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async uploadVideo(file: File, folder = 'videos', preserveOriginalName = false): Promise<string> {
    try {
      if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        throw new Error(`Unsupported video type: ${file.type}. Supported types: ${SUPPORTED_VIDEO_TYPES.join(', ')}`);
      }

      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Video size should be less than 200MB');
      }

      const fileName = preserveOriginalName 
        ? generateOriginalFileName(file.name)
        : generateSafeFileName(file.name);
      
      const key = folder ? `${folder}/${fileName}` : fileName;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: 'boligmatch',
        Key: key,
        Body: uint8Array,
        ACL: 'public-read',
        ContentType: file.type,
        ContentLength: file.size,
      });

      await s3Client.send(command);

      return `https://boligmatch.blr1.digitaloceanspaces.com/${key}`;
    } catch (error) {
      console.error('Video upload error details:', error);
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async uploadDocument(file: File, folder = 'documents', preserveOriginalName = false): Promise<string> {
    try {
      if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
        throw new Error(`Unsupported document type: ${file.type}. Supported types: ${SUPPORTED_DOCUMENT_TYPES.join(', ')}`);
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Document size should be less than 50MB');
      }

      const fileName = preserveOriginalName 
        ? generateOriginalFileName(file.name)
        : generateSafeFileName(file.name);
      
      const key = folder ? `${folder}/${fileName}` : fileName;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: 'boligmatch',
        Key: key,
        Body: uint8Array,
        ACL: 'public-read',
        ContentType: file.type,
        ContentLength: file.size,
      });

      await s3Client.send(command);

      return `https://boligmatch.blr1.digitaloceanspaces.com/${key}`;
    } catch (error) {
      console.error('Document upload error details:', error);
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generic upload method with option to preserve original name
  async uploadFile(file: File, folder = 'uploads', preserveOriginalName = false): Promise<string> {
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return this.uploadImage(file, folder, preserveOriginalName);
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      return this.uploadVideo(file, folder, preserveOriginalName);
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
      return this.uploadDocument(file, folder, preserveOriginalName);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }
};

export default uploadService;

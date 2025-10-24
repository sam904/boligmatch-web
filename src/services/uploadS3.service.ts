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

function generateRandomFileName(originalName: string): string {
  const extension = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}.${extension}`;
}

// Supported file types
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

export const uploadService = {
  async uploadImage(file: File, folder = 'images'): Promise<string> {
    try {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Unsupported image type: ${file.type}. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`);
      }

      const fileName = generateRandomFileName(file.name);
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

  async uploadVideo(file: File, folder = 'videos'): Promise<string> {
    try {
      if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        throw new Error(`Unsupported video type: ${file.type}. Supported types: ${SUPPORTED_VIDEO_TYPES.join(', ')}`);
      }

      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Video size should be less than 200MB');
      }

      const fileName = generateRandomFileName(file.name);
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

  async uploadDocument(file: File, folder = 'documents'): Promise<string> {
    try {
      // Validate file type
      if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
        throw new Error(`Unsupported document type: ${file.type}. Supported types: ${SUPPORTED_DOCUMENT_TYPES.join(', ')}`);
      }

      // Increased size limit for documents (50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        throw new Error('Document size should be less than 50MB');
      }

      const fileName = generateRandomFileName(file.name);
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

  // Generic upload method that auto-detects file type
  async uploadFile(file: File, folder = 'uploads'): Promise<string> {
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return this.uploadImage(file, folder);
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      return this.uploadVideo(file, folder);
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
      return this.uploadDocument(file, folder);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }
};

export default uploadService;






// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// const SPACES_ACCESS_KEY = import.meta.env.VITE_DO_SPACES_ACCESS_KEY;
// const SPACES_SECRET_KEY = import.meta.env.VITE_DO_SPACES_SECRET_KEY;

// const s3Client = new S3Client({
//   region: 'blr1',
//   endpoint: 'https://blr1.digitaloceanspaces.com',
//   credentials: {
//     accessKeyId: SPACES_ACCESS_KEY,
//     secretAccessKey: SPACES_SECRET_KEY,
//   },
//   forcePathStyle: false,
// });

// function generateRandomFileName(originalName: string): string {
//   const extension = originalName.split('.').pop() || 'jpg';
//   const timestamp = Date.now();
//   const randomString = Math.random().toString(36).substring(2, 15);
//   return `${timestamp}-${randomString}.${extension}`;
// }

// export const uploadService = {
//   async uploadImage(file: File, folder = 'images'): Promise<string> {
//     try {
//       const fileName = generateRandomFileName(file.name);
//       const key = folder ? `${folder}/${fileName}` : fileName;

//       // Convert File to ArrayBuffer to avoid stream issues
//       const arrayBuffer = await file.arrayBuffer();
//       const uint8Array = new Uint8Array(arrayBuffer);

//       const command = new PutObjectCommand({
//         Bucket: 'boligmatch',
//         Key: key,
//         Body: uint8Array, // Use Uint8Array instead of File
//         ACL: 'public-read',
//         ContentType: file.type,
//         ContentLength: file.size,
//       });

//       await s3Client.send(command);

//       return `https://boligmatch.blr1.digitaloceanspaces.com/${key}`;
//     } catch (error) {
//       console.error('Upload error details:', error);
//       throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
// };

// export default uploadService;
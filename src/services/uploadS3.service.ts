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

export const uploadService = {
  async uploadImage(file: File, folder = 'images'): Promise<string> {
    try {
      const fileName = generateRandomFileName(file.name);
      const key = folder ? `${folder}/${fileName}` : fileName;

      // Convert File to ArrayBuffer to avoid stream issues
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: 'boligmatch',
        Key: key,
        Body: uint8Array, // Use Uint8Array instead of File
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
  }
};

export default uploadService;
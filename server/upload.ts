import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const BUCKET_NAME = 'boligmatch';
const REGION = 'blr1';
const ENDPOINT = `https://${REGION}.digitaloceanspaces.com`;
const PUBLIC_URL = `https://${BUCKET_NAME}.${REGION}.digitaloceanspaces.com`;

const s3Client = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || '',
  },
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.body.folder || 'images';
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);
    
    const url = `${PUBLIC_URL}/${fileName}`;
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Upload server running on port ${PORT}`);
});

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Oracle Cloud Object Storage uses S3 compatible APIs
export const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-sanjose-1',
  endpoint: process.env.S3_ENDPOINT, // e.g. https://<namespace>.compat.objectstorage.us-sanjose-1.oraclecloud.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for Oracle Object Storage
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'openrockets-artifacts';

/**
 * Utility to upload a file to Oracle Cloud Object Storage
 */
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function uploadToStorage(key: string, body: Buffer | Uint8Array | Blob, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await s3Client.send(command);
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 900) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 300) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

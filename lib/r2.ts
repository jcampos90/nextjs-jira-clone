import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as createPresignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

/**
 * Upload a file to Cloudflare R2.
 * @param buffer - File content as Buffer
 * @param filename - Original filename
 * @param mimeType - MIME type of the file
 * @returns The storage key (object key) for the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const storageKey = `attachments/${Date.now()}-${filename}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return storageKey;
}

/**
 * Delete a file from Cloudflare R2.
 * @param storageKey - The R2 object key
 */
export async function deleteFile(storageKey: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    }),
  );
}

/**
 * Get a temporary signed URL to download a file from R2.
 * @param storageKey - The R2 object key
 * @returns Signed URL valid for 1 hour
 */
export async function getSignedUrl(storageKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
  });

  return createPresignedUrl(r2Client, command, { expiresIn: 3600 });
}

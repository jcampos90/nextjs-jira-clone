import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as createPresignedUrl } from '@aws-sdk/s3-request-presigner';

const idriveClient = new S3Client({
  region: process.env.IDRIVE_REGION || 'us-east-1',
  endpoint: process.env.IDRIVE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.IDRIVE_BUCKET_NAME!;

/**
 * Upload a file to IDrive E2.
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

  await idriveClient.send(
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
 * Delete a file from IDrive E2.
 * @param storageKey - The IDrive E2 object key
 */
export async function deleteFile(storageKey: string): Promise<void> {
  await idriveClient.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    }),
  );
}

/**
 * Get a temporary signed URL to download a file from IDrive E2.
 * @param storageKey - The IDrive E2 object key
 * @returns Signed URL valid for 1 hour
 */
export async function getSignedUrl(storageKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
  });

  return createPresignedUrl(idriveClient, command, { expiresIn: 3600 });
}

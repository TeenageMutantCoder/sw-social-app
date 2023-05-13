import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

function checkIsString(input: string | undefined): input is string {
  return typeof input === 'string';
}

if (!checkIsString(process.env.S3_URL))
  throw new Error('env: S3_URL needs to be a string');
if (!checkIsString(process.env.S3_REGION))
  throw new Error('env: S3_REGION needs to be a string');
if (!checkIsString(process.env.S3_BUCKET_NAME))
  throw new Error('env: S3_BUCKET_NAME needs to be a string');
if (!checkIsString(process.env.S3_ACCESS_KEY_ID))
  throw new Error('env: S3_ACCESS_KEY_ID needs to be a string');
if (!checkIsString(process.env.S3_SECRET_ACCESS_KEY))
  throw new Error('env: S3_SECRET_ACCESS_KEY needs to be a string');

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const client = new S3Client({
  endpoint: process.env.S3_URL,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export async function getPresignedUploadUrl(
  options: Omit<PutObjectCommandInput, 'Bucket' | 'Key'> = {}
) {
  const key = randomUUID();
  const command = new PutObjectCommand({
    ...options,
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  return { uploadUrl, externalId: key };
}

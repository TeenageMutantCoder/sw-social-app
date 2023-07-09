import { z } from 'zod';
import { getPresignedUploadUrl } from '../s3';
import { createProtectedRouter } from './protected-router';

export const protectedFileRouter = createProtectedRouter().query(
  'getPresignedUploadUrl',
  {
    input: z.string(),
    async resolve({ input }) {
      return getPresignedUploadUrl({ ContentMD5: input });
    },
  }
);

// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { protectedPostsRouter } from './protected-posts-router';
import { postsRouter } from './posts-router';
import { protectedCommentsRouter } from './protected-comments-router';
import { protectedFileRouter } from './protected-file-router';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('posts.', postsRouter)
  .merge('posts.', protectedPostsRouter)
  .merge('comments.', protectedCommentsRouter)
  .merge('files.', protectedFileRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

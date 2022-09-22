// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { protectedPostsRouter } from './protected-posts-router';
import { postsRouter } from './posts-router';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('posts.', postsRouter)
  .merge('posts.', protectedPostsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

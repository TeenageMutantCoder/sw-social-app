import { z } from 'zod';
import { createRouter } from './context';

export const postsRouter = createRouter()
  .query('getAllPosts', {
    async resolve({ ctx }) {
      const posts = await ctx.prisma.post.findMany({
        select: {
          id: true,
          title: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });
      return posts;
    },
  })
  .query('getPost', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: input,
        },
        select: {
          title: true,
          body: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return post;
    },
  });

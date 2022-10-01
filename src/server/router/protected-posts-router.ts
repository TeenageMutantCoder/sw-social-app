import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createProtectedRouter } from './protected-router';

export const protectedPostsRouter = createProtectedRouter()
  .mutation('createPost', {
    input: z.object({
      title: z.string(),
      body: z.string(),
    }),
    async resolve({ ctx, input }) {
      const newPost = await ctx.prisma.post.create({
        data: {
          title: input.title,
          body: input.body,
          userId: ctx.session.user.id,
        },
      });

      return newPost;
    },
  })
  .mutation('updatePost', {
    input: z
      .object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
      })
      .partial({
        title: true,
        body: true,
      })
      .refine(
        (data) => data.title || data.body,
        'Either a title or body must be present in the request body'
      ),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: { id: input.id },
        select: { userId: true },
      });
      if (post.userId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });

      const updatedPost = await ctx.prisma.post.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          body: input.body,
        },
      });
      return updatedPost;
    },
  })
  .mutation('deletePost', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: { id: input },
        select: { userId: true },
      });
      if (post.userId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });

      const deletedPost = ctx.prisma.post.delete({
        where: { id: input },
      });
      return deletedPost;
    },
  })
  .mutation('reactToPost', {
    input: z.object({ postId: z.string(), isLike: z.boolean() }),
    async resolve({ ctx, input }) {
      const existingReaction = await ctx.prisma.postReaction.findUnique({
        where: {
          // eslint-disable-next-line camelcase
          userId_postId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
        select: { isLike: true },
      });

      if (existingReaction?.isLike === input.isLike) {
        return await ctx.prisma.postReaction.delete({
          where: {
            // eslint-disable-next-line camelcase
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
        });
      }

      if (existingReaction) {
        return await ctx.prisma.postReaction.update({
          where: {
            // eslint-disable-next-line camelcase
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
          data: { isLike: input.isLike },
        });
      }

      return await ctx.prisma.postReaction.create({
        data: {
          userId: ctx.session.user.id,
          postId: input.postId,
          isLike: input.isLike,
        },
      });
    },
  });

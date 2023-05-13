import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createProtectedRouter } from './protected-router';

export const protectedPostsRouter = createProtectedRouter()
  .mutation('createPost', {
    input: z.object({
      title: z.string(),
      body: z.string(),
      media: z
        .object({
          externalId: z.string(),
          contentType: z.string(),
        })
        .array(),
    }),
    async resolve({ ctx, input }) {
      const newPost = await ctx.prisma.post.create({
        data: {
          title: input.title,
          body: input.body,
          userId: ctx.session.user.id,
          media: {
            create: input.media,
          },
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

      const currentPost = await ctx.prisma.post.findUniqueOrThrow({
        where: { id: input.postId },
        select: {
          points: true,
        },
      });

      const currentPoints = currentPost.points;
      let reaction, post;

      // User makes their initial reaction
      if (!existingReaction) {
        reaction = await ctx.prisma.postReaction.create({
          data: {
            userId: ctx.session.user.id,
            postId: input.postId,
            isLike: input.isLike,
          },
        });

        post = await ctx.prisma.post.update({
          where: { id: input.postId },
          data: {
            points: input.isLike ? currentPoints + 1 : currentPoints - 1,
          },
        });
      }

      // User removes their existing reaction
      else if (existingReaction.isLike === input.isLike) {
        reaction = await ctx.prisma.postReaction.delete({
          where: {
            // eslint-disable-next-line camelcase
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
        });

        post = await ctx.prisma.post.update({
          where: { id: input.postId },
          data: {
            points: input.isLike ? currentPoints - 1 : currentPoints + 1,
          },
        });
      }

      // User changes their reaction
      else {
        reaction = await ctx.prisma.postReaction.update({
          where: {
            // eslint-disable-next-line camelcase
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
          data: { isLike: input.isLike },
        });

        post = await ctx.prisma.post.update({
          where: { id: input.postId },
          data: {
            points: input.isLike ? currentPoints + 2 : currentPoints - 2,
          },
        });
      }

      return { reaction, post };
    },
  });

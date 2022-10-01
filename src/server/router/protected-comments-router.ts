import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createProtectedRouter } from './protected-router';

export const protectedCommentsRouter = createProtectedRouter()
  .mutation('createComment', {
    input: z.object({
      postId: z.string(),
      parentCommentId: z.string().nullish(),
      body: z.string(),
    }),
    async resolve({ ctx, input }) {
      const newComment = await ctx.prisma.comment.create({
        data: {
          body: input.body,
          postId: input.postId,
          parentId: input.parentCommentId,
          userId: ctx.session.user.id,
        },
      });

      return newComment;
    },
  })
  .mutation('updateComment', {
    input: z.object({
      id: z.string(),
      body: z.string(),
    }),
    async resolve({ ctx, input }) {
      const comment = await ctx.prisma.comment.findUniqueOrThrow({
        where: { id: input.id },
        select: { userId: true },
      });
      if (comment.userId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });

      const updatedComment = await ctx.prisma.comment.update({
        where: {
          id: input.id,
        },
        data: {
          body: input.body,
        },
      });
      return updatedComment;
    },
  })
  .mutation('deleteComment', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const comment = await ctx.prisma.comment.findUniqueOrThrow({
        where: { id: input },
        select: {
          userId: true,
          _count: { select: { children: true } },
        },
      });
      if (comment.userId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });

      let deletedComment;
      // If the comment has children, then deleting the comment would mess up the comment tree.
      // To avoid this, we will only mark it as deleted in that case.
      if (comment._count.children > 0) {
        deletedComment = ctx.prisma.comment.update({
          where: { id: input },
          data: {
            deleted: true,
          },
        });
      } else {
        deletedComment = ctx.prisma.comment.delete({
          where: { id: input },
        });
      }
      return deletedComment;
    },
  });

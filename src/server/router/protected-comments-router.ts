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
  })
  .mutation('reactToComment', {
    input: z.object({ commentId: z.string(), isLike: z.boolean() }),
    async resolve({ ctx, input }) {
      const existingReaction = await ctx.prisma.commentReaction.findUnique({
        where: {
          // eslint-disable-next-line camelcase
          userId_commentId: {
            userId: ctx.session.user.id,
            commentId: input.commentId,
          },
        },
        select: { isLike: true },
      });

      const currentComment = await ctx.prisma.comment.findUniqueOrThrow({
        where: { id: input.commentId },
        select: {
          points: true,
        },
      });

      const currentPoints = currentComment.points;
      let reaction, comment;

      // User makes their initial reaction
      if (!existingReaction) {
        reaction = await ctx.prisma.commentReaction.create({
          data: {
            userId: ctx.session.user.id,
            commentId: input.commentId,
            isLike: input.isLike,
          },
        });

        comment = await ctx.prisma.comment.update({
          where: { id: input.commentId },
          data: {
            points: input.isLike ? currentPoints + 1 : currentPoints - 1,
          },
        });
      }

      // User removes their existing reaction
      else if (existingReaction.isLike === input.isLike) {
        reaction = await ctx.prisma.commentReaction.delete({
          where: {
            // eslint-disable-next-line camelcase
            userId_commentId: {
              userId: ctx.session.user.id,
              commentId: input.commentId,
            },
          },
        });

        comment = await ctx.prisma.comment.update({
          where: { id: input.commentId },
          data: {
            points: input.isLike ? currentPoints - 1 : currentPoints + 1,
          },
        });
      }

      // User changes their reaction
      else {
        reaction = await ctx.prisma.commentReaction.update({
          where: {
            // eslint-disable-next-line camelcase
            userId_commentId: {
              userId: ctx.session.user.id,
              commentId: input.commentId,
            },
          },
          data: { isLike: input.isLike },
        });

        comment = await ctx.prisma.comment.update({
          where: { id: input.commentId },
          data: {
            points: input.isLike ? currentPoints + 2 : currentPoints - 2,
          },
        });
      }

      return { reaction, comment };
    },
  });

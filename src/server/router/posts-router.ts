import { z } from 'zod';
import { createRouter } from './context';

export const postsRouter = createRouter()
  .query('getAllPosts', {
    async resolve({ ctx }) {
      const posts = await ctx.prisma.post.findMany({
        select: {
          id: true,
          title: true,
          points: true,
          media: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
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
          points: true,
          media: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          comments: {
            select: {
              id: true,
              body: true,
              deleted: true,
              points: true,
              commentReactions: {
                select: { isLike: true },
                where: { userId: ctx.session?.user?.id },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              parent: {
                select: {
                  id: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      let usersPostReaction = null;
      if (ctx.session?.user?.id) {
        usersPostReaction = await ctx.prisma.postReaction.findUnique({
          select: {
            isLike: true,
          },
          where: {
            // eslint-disable-next-line camelcase
            userId_postId: {
              userId: ctx.session?.user?.id,
              postId: input,
            },
          },
        });
      }

      const isLikedByCurrentUser = !!usersPostReaction?.isLike;
      const isDislikedByCurrentUser =
        usersPostReaction && !usersPostReaction.isLike;

      const data = {
        post,
        isLikedByCurrentUser,
        isDislikedByCurrentUser,
      };
      return data;
    },
  });

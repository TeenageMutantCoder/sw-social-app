import { useMemo } from 'react';
import { inferQueryOutput } from '../utils/trpc';
import Comment from './comment';

type TComments = inferQueryOutput<'posts.getPost'>['post']['comments'];
type TComment = TComments[0];
export type TCommentWithChildren = TComment & {
  children?: TComment[];
};

const getCommentTreeFromComments = (
  comments: TCommentWithChildren[] | undefined,
  parentId: string | undefined
) => {
  if (comments === undefined || comments.length === 0) return [];
  const rootComments = comments.filter((comment) => {
    return comment.parent?.id === parentId;
  });
  const otherComments = comments.filter((comment) => {
    return comment.parent?.id !== parentId;
  });

  for (let comment of rootComments) {
    comment.children = getCommentTreeFromComments(otherComments, comment.id);
  }
  return rootComments;
};

type TCommentsProps = {
  comments: TComments | undefined;
  postId: string;
  refetchPost: () => void;
};
const Comments = ({ comments, postId, refetchPost }: TCommentsProps) => {
  const commentTree = useMemo(() => {
    return getCommentTreeFromComments(comments, undefined);
  }, [comments]);

  return (
    <>
      {commentTree.map((comment) => (
        <Comment
          key={comment.id}
          body={comment.body}
          isLiked={!!comment.commentReactions[0]?.isLike}
          isDisliked={
            comment.commentReactions[0] !== undefined
              ? !comment.commentReactions[0].isLike
              : false
          }
          user={comment.user}
          points={comment.points}
          isDeleted={comment.deleted}
          childComments={comment.children}
          commentId={comment.id}
          postId={postId}
          refetchPost={refetchPost}
        />
      ))}
    </>
  );
};

export default Comments;

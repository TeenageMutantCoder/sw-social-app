import { useCallback, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { inferQueryOutput } from '../utils/trpc';
import Button from './button';
import Comment from './comment';
import NewCommentForm from './new-comment-form';

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
  const { status } = useSession();
  const [shouldShowComments, setShouldShowComments] = useState(false);

  const showComments = useCallback(() => {
    setShouldShowComments(true);
  }, [setShouldShowComments]);

  const hideComments = useCallback(() => {
    setShouldShowComments(false);
  }, [setShouldShowComments]);

  const commentTree = useMemo(() => {
    return getCommentTreeFromComments(comments, undefined);
  }, [comments]);

  if (!shouldShowComments)
    return (
      <Button className="w-full" theme="alternative" onClick={showComments}>
        Show comments
      </Button>
    );

  return (
    <>
      <Button className="w-full" theme="alternative" onClick={hideComments}>
        Hide comments
      </Button>
      <div className="mt-3">
        {status === 'authenticated' && (
          <NewCommentForm postId={postId} onSubmit={refetchPost} />
        )}
        {commentTree.length === 0 && <p>No comments, yet.</p>}
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
      </div>
    </>
  );
};

export default Comments;

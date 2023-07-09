import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import type { TCommentWithChildren } from './comments';
import NewCommentForm from './new-comment-form';
import OwnerActions from './owner-actions';
import Reactions from './reactions';
import Form from './form';

type TCommentProps = {
  className?: string;
  style?: CSSProperties;
  body: string;
  user: { name: string; id: string };
  points: number;
  isLiked: boolean;
  isDisliked: boolean;
  isDeleted: boolean;
  childComments: TCommentWithChildren[] | undefined;
  postId: string;
  commentId: string;
  refetchPost: () => void;
};

type TEditCommentFormInput = {
  body: string;
};

const Comment = ({
  className,
  style,
  body,
  user,
  isLiked,
  isDisliked,
  points,
  isDeleted,
  childComments,
  postId,
  commentId,
  refetchPost,
}: TCommentProps) => {
  const { register, handleSubmit, reset } = useForm<TEditCommentFormInput>();
  const { data: session, status } = useSession();
  const deleteCommentMutation = trpc.useMutation(['comments.deleteComment']);
  const updateCommentMutation = trpc.useMutation(['comments.updateComment']);
  const deleteComment = useCallback(() => {
    deleteCommentMutation.mutateAsync(commentId).then(() => {
      refetchPost();
    });
  }, [refetchPost, deleteCommentMutation, commentId]);

  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const startEditingComment = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const stopEditingComment = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  const onSubmitHandler: SubmitHandler<TEditCommentFormInput> = useCallback(
    ({ body }) => {
      updateCommentMutation.mutateAsync({ id: commentId, body }).then(() => {
        reset();
        stopEditingComment();
        refetchPost();
      });
    },
    [updateCommentMutation, reset, commentId, stopEditingComment, refetchPost]
  );

  const commentReactionMutation = trpc.useMutation(['comments.reactToComment']);

  const upvoteComment = useCallback(() => {
    commentReactionMutation
      .mutateAsync({ isLike: true, commentId })
      .then(() => {
        refetchPost();
      });
  }, [commentReactionMutation, commentId, refetchPost]);

  const downvoteComment = useCallback(() => {
    commentReactionMutation
      .mutateAsync({ isLike: false, commentId })
      .then(() => {
        refetchPost();
      });
  }, [commentReactionMutation, commentId, refetchPost]);

  return (
    <div style={style} className={`mb-2 ${className}`}>
      {isEditing && (
        <Form
          submitHandler={handleSubmit(onSubmitHandler)}
          cancelHandler={stopEditingComment}
        >
          <textarea
            placeholder="Body"
            defaultValue={body}
            {...register('body', { required: true })}
          />
        </Form>
      )}

      {!isEditing && (
        <>
          <p className="break-words">{isDeleted ? 'deleted' : body}</p>
          <p className="text-xs">
            Written by: {isDeleted ? 'deleted' : user.name}
          </p>

          {!isDeleted && (
            <div className="flex justify-between items-center -ml-1 ">
              <Reactions
                upvote={upvoteComment}
                downvote={downvoteComment}
                isLiked={isLiked}
                isDisliked={isDisliked}
                points={points}
                horizontal
              />
              {status === 'authenticated' && (
                <div className="flex gap-2">
                  <OwnerActions
                    isOwner={session?.user?.id === user.id}
                    deleteHandler={deleteComment}
                    editHandler={startEditingComment}
                  />
                  <button
                    className="text-sm text-neutral-500 hover:text-neutral-300 font-semibold"
                    onClick={() => setIsReplying((replying) => !replying)}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {status === 'authenticated' && isReplying && (
        <NewCommentForm
          parentId={commentId}
          postId={postId}
          refetchPost={refetchPost}
        />
      )}

      <div className="ml-3 mt-2 pl-3" style={{ borderLeft: '1px solid gray' }}>
        {childComments?.map((child) => (
          <Comment
            key={child.id}
            body={child.body}
            points={child.points}
            isLiked={!!child.commentReactions[0]?.isLike}
            isDisliked={
              child.commentReactions[0] !== undefined
                ? !child.commentReactions[0].isLike
                : false
            }
            isDeleted={child.deleted}
            user={child.user}
            childComments={child.children}
            postId={postId}
            commentId={child.id}
            refetchPost={refetchPost}
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;

import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import type { TCommentWithChildren } from './comments';
import NewCommentForm from './new_comment_form';
import OwnerActions from './owner_actions';
import Reactions from './reactions';
import Form from './form';

type TCommentProps = {
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
    <div className="ml-3">
      {isEditing ? (
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
      ) : (
        <>
          <p>{isDeleted ? 'deleted' : body}</p>
          <p>{isDeleted ? 'deleted' : user.name}</p>
          <p>{points} points</p>
        </>
      )}

      {!isDeleted && session?.user?.id === user.id && (
        <OwnerActions
          deleteHandler={deleteComment}
          editHandler={startEditingComment}
        />
      )}

      {status === 'authenticated' && (
        <>
          {!isDeleted && (
            <Reactions
              upvote={upvoteComment}
              downvote={downvoteComment}
              isLiked={isLiked}
              isDisliked={isDisliked}
            />
          )}
          <NewCommentForm
            parentId={commentId}
            postId={postId}
            refetchPost={refetchPost}
          />
        </>
      )}
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
  );
};

export default Comment;

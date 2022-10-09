import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Button from './button';

type TNewCommentFormProps = {
  postId: string;
  refetchPost: () => void;
  parentId?: string;
};

type TNewCommentFormInput = {
  body: string;
};

const NewCommentForm = ({
  postId,
  parentId,
  refetchPost,
}: TNewCommentFormProps) => {
  const createComment = trpc.useMutation(['comments.createComment']);
  const { register, handleSubmit, reset } = useForm<TNewCommentFormInput>();

  const onSubmitHandler: SubmitHandler<TNewCommentFormInput> = useCallback(
    ({ body }) => {
      createComment
        .mutateAsync({ body, parentCommentId: parentId, postId })
        .then(() => {
          reset();
          refetchPost();
        });
    },
    [parentId, postId, createComment, reset, refetchPost]
  );

  return (
    <form name="new-comment" onSubmit={handleSubmit(onSubmitHandler)}>
      <textarea
        placeholder="Add your comment"
        {...register('body', { required: true })}
      />
      <br />
      <Button type="submit" />
    </form>
  );
};

export default NewCommentForm;

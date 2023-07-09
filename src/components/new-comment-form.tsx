import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Form from './form';

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
    <Form submitHandler={handleSubmit(onSubmitHandler)} submitOnly={true} className="mb-2">
      <textarea
        className="w-full"
        placeholder="Add your comment"
        {...register('body', { required: true })}
      />
    </Form>
  );
};

export default NewCommentForm;

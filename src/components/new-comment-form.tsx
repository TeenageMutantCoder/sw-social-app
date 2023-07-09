import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Form from './form';

type TNewCommentFormProps = {
  postId: string;
  onSubmit: () => void;
  parentId?: string;
  cancelHandler?: () => void;
};

type TNewCommentFormInput = {
  body: string;
};

const NewCommentForm = ({
  postId,
  parentId,
  onSubmit,
  cancelHandler,
}: TNewCommentFormProps) => {
  const createComment = trpc.useMutation(['comments.createComment']);
  const { register, handleSubmit, reset } = useForm<TNewCommentFormInput>();

  const onSubmitHandler: SubmitHandler<TNewCommentFormInput> = useCallback(
    ({ body }) => {
      createComment
        .mutateAsync({ body, parentCommentId: parentId, postId })
        .then(() => {
          reset();
          onSubmit();
        });
    },
    [parentId, postId, createComment, reset, onSubmit]
  );

  return (
    <Form
      submitHandler={handleSubmit(onSubmitHandler)}
      cancelHandler={cancelHandler}
      submitOnly={true}
      className="mb-2"
    >
      <textarea
        className="w-full"
        placeholder="Add your comment"
        {...register('body', { required: true })}
      />
    </Form>
  );
};

export default NewCommentForm;

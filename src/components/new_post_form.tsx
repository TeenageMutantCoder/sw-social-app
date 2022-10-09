import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Button from './button';
import Form from './form';

type TNewPostFormInput = {
  title: string;
  body: string;
};

type TNewPostFormProps = {
  className: string;
  refetchPosts: () => void;
};

const NewPostForm = ({ className, refetchPosts }: TNewPostFormProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const createPost = trpc.useMutation(['posts.createPost']);
  const { register, handleSubmit, reset } = useForm<TNewPostFormInput>();

  const onSubmitHandler: SubmitHandler<TNewPostFormInput> = useCallback(
    ({ title, body }) => {
      createPost.mutateAsync({ title, body }).then(() => {
        reset();
        setIsOpen(false);
        refetchPosts();
        router.push('/?created_post=true');
      });
    },
    [createPost, reset, refetchPosts, router]
  );

  const stopCreatingPost = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  if (!isOpen)
    return (
      <Button
        theme="light"
        className="w-full mb-5"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Create a new post
      </Button>
    );

  return (
    <Form
      submitHandler={handleSubmit(onSubmitHandler)}
      cancelHandler={stopCreatingPost}
      className={className}
    >
      <input
        type="text"
        placeholder="Title"
        {...register('title', { required: true })}
      />
      <textarea placeholder="Body" {...register('body', { required: true })} />
    </Form>
  );
};

export default NewPostForm;

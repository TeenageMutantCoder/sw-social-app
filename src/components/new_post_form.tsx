import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Button from './button';

type TNewPostFormInput = {
  title: string;
  body: string;
};

type TNewPostFormProps = { refetchPosts: () => void };

const NewPostForm = ({ refetchPosts }: TNewPostFormProps) => {
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
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Create a new post
      </Button>
    );

  return (
    <form name="new-post" onSubmit={handleSubmit(onSubmitHandler)}>
      <input
        type="text"
        placeholder="Title"
        {...register('title', { required: true })}
      />
      <br />
      <textarea placeholder="Body" {...register('body', { required: true })} />
      <div className="flex">
        <Button type="submit" />
        <Button theme="alternative" onClick={stopCreatingPost}>
          Cancel
        </Button>
        <Button theme="alternative" type="reset" />
      </div>
    </form>
  );
};

export default NewPostForm;

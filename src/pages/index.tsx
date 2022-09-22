import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';

type FormInput = {
  title: string;
  body: string;
};

const NewPostForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const createPost = trpc.useMutation(['posts.createPost']);
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const onSubmitHandler: SubmitHandler<FormInput> = (data) => {
    const { title, body } = data;

    createPost.mutateAsync({ title, body }).then(() => reset());
  };

  if (!isOpen)
    return (
      <button
        className="btn btn-primary"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
      >
        Create a new post
      </button>
    );

  return (
    <form name="new-post" onSubmit={handleSubmit(onSubmitHandler)}>
      <input
        className="form-control input input-bordered my-2"
        placeholder="Title"
        {...register('title', { required: true })}
      />
      <textarea
        className="form-control textarea textarea-bordered my-2"
        placeholder="Body"
        {...register('body', { required: true })}
      />
      <input className="form-control btn btn-primary my-4" type="submit" />
    </form>
  );
};

const Home: NextPage = () => {
  const getPostsQuery = trpc.useQuery(['posts.getAllPosts']);
  const router = useRouter();
  const { status } = useSession();

  return (
    <>
      {status === 'authenticated' && <NewPostForm />}
      {status === 'unauthenticated' && (
        <p>
          Please{' '}
          <a className="link-primary" href="#" onClick={() => signIn()}>
            sign in
          </a>{' '}
          to create a post
        </p>
      )}
      {getPostsQuery.data?.length === 0 && <p>No posts here, yet</p>}
      {getPostsQuery.isLoading && <p>Loading...</p>}
      {getPostsQuery.isError && (
        <p>There was an error while getting the posts.</p>
      )}
      {getPostsQuery.data?.map(({ id, user, title }) => (
        <div
          key={id}
          className="p-3 mt-2 bg-gray-700 hover:bg-gray-600"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            router.push(`/posts/${id}`);
          }}
        >
          {title} - {user.name}
        </div>
      ))}
    </>
  );
};

export default Home;

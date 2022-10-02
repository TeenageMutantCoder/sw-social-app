import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import Toast from '../components/toast';

type FormInput = {
  title: string;
  body: string;
};

const NewPostForm = ({ refetchPosts }: { refetchPosts: () => void }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const createPost = trpc.useMutation(['posts.createPost']);
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const onSubmitHandler: SubmitHandler<FormInput> = useCallback(
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

  if (!isOpen)
    return (
      <button
        className="btn btn-primary"
        onClick={() => {
          setIsOpen(true);
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
  const hasDeletedPost = router.query.deleted_post;
  const hasCreatedPost = router.query.created_post;
  const refetchPosts = useCallback(() => {
    getPostsQuery.refetch();
  }, [getPostsQuery]);

  return (
    <>
      {hasDeletedPost && (
        <Toast alertType="success">Successfully deleted post.</Toast>
      )}
      {hasCreatedPost && (
        <Toast alertType="success">Successfully created post.</Toast>
      )}
      {status === 'authenticated' && (
        <NewPostForm refetchPosts={refetchPosts} />
      )}
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
      {getPostsQuery.data?.map(({ id, user, title, points }) => (
        <div
          key={id}
          className="p-3 mt-2 bg-gray-700 hover:bg-gray-600"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            router.push(`/posts/${id}`);
          }}
        >
          {title} - {user.name} - {points} points
        </div>
      ))}
    </>
  );
};

export default Home;

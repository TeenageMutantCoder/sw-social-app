import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import Alert from '../components/alert';
import Button from '../components/button';

type TFormInput = {
  title: string;
  body: string;
};

const NewPostForm = ({ refetchPosts }: { refetchPosts: () => void }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const createPost = trpc.useMutation(['posts.createPost']);
  const { register, handleSubmit, reset } = useForm<TFormInput>();

  const onSubmitHandler: SubmitHandler<TFormInput> = useCallback(
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
        <Alert alertType="success">Successfully deleted post.</Alert>
      )}
      {hasCreatedPost && (
        <Alert alertType="success">Successfully created post.</Alert>
      )}
      {status === 'authenticated' && (
        <NewPostForm refetchPosts={refetchPosts} />
      )}
      {status === 'unauthenticated' && (
        <p>
          Please{' '}
          <a href="#" onClick={() => signIn()}>
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
          className="p-3 mt-2 bg-gray-300 hover:bg-gray-400 transition-all"
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

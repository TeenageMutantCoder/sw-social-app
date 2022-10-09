import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import Alert from '../components/alert';
import Button from '../components/button';
import NewPostForm from '../components/new_post_form';

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
        <NewPostForm className="mb-4" refetchPosts={refetchPosts} />
      )}

      {status === 'unauthenticated' && (
        <p className="mb-4 text-center">
          Please{' '}
          <a
            className="text-blue-500 font-bold"
            href="#"
            onClick={() => signIn()}
          >
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
        <Button
          key={id}
          theme="outline-dark"
          className="w-full text-left"
          onClick={() => {
            router.push(`/posts/${id}`);
          }}
        >
          <h2 className="text-lg break-words">{title}</h2>
          <p className="text-sm">{user.name}</p>
          <p className="text-sm">{points} points</p>
        </Button>
      ))}
    </>
  );
};

export default Home;

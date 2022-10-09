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
        <Button
          key={id}
          theme="outline-dark"
          className="w-full text-left"
          style={{ textAlign: 'left' }}
          onClick={() => {
            router.push(`/posts/${id}`);
          }}
        >
          {title} - {user.name} - {points} points
        </Button>
      ))}
    </>
  );
};

export default Home;

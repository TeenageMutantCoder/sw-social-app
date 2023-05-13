import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import Alert from '../components/alert';
import Button from '../components/button';
import NewPostForm from '../components/new_post_form';
import Image from 'next/image';

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

      {getPostsQuery.data?.map(({ id, user, title, points, media }) => (
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
          {media.map(({ externalId }) => (
            <Image
              key={externalId}
              src={`https://pub-6a839333599b4921a1f2e53b7f0fdc23.r2.dev/${externalId}`}
              alt={`Image for ${title}`}
              height={200}
              width={200}
            />
          ))}
        </Button>
      ))}
    </>
  );
};

export default Home;

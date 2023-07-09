import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import { showAlert } from '../components/alert';
import NewPostForm from '../components/new-post-form';
import Image from 'next/image';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { getPointsText } from '../utils';
import Spinner from '../components/spinner';
import Button from '../components/button';

const Home: NextPage = () => {
  const getPostsQuery = trpc.useQuery(['posts.getAllPosts']);
  const router = useRouter();
  const { status } = useSession();
  const postReactionMutation = trpc.useMutation(['posts.reactToPost']);
  const refetchPosts = useCallback(() => {
    getPostsQuery.refetch();
  }, [getPostsQuery]);

  const hasDeletedPost = router.query.deleted_post;
  const hasCreatedPost = router.query.created_post;

  useEffect(() => {
    if (!hasDeletedPost && !hasCreatedPost) return; // Early return to prevent infinite loop
    if (hasDeletedPost) showAlert('Successfully deleted post.', 'success');
    if (hasCreatedPost) showAlert('Successfully created post.', 'success');
    router.replace('/');
  }, [router, hasDeletedPost, hasCreatedPost]);

  return (
    <>
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
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
        {getPostsQuery.isLoading && <Spinner className="-z-10" />}
        {getPostsQuery.isError && (
          <div className="w-full h-full fixed top-0 left-0 flex flex-col justify-center items-center -z-10">
            <p className="text-center text-lg font-bold mb-2">
              There was an error while getting the posts.
            </p>
            <Button onClick={refetchPosts}>Try again</Button>
          </div>
        )}

        {getPostsQuery.data?.map(
          ({ id, user, title, points, media, postReactions }) => (
            <div className="flex my-2" key={id}>
              <div className="flex flex-col items-center w-12 border border-neutral-700">
                <button
                  className={`w-min p-1 text-2xl hover:scale-125 transition-transform ${status === 'authenticated' && postReactions[0]?.isLike
                      ? 'fill-green-500'
                      : ''
                    }`}
                  onClick={() => {
                    if (status === 'unauthenticated') {
                      showAlert(
                        'Please log in to perform this action.',
                        'danger'
                      );
                      return;
                    }
                    postReactionMutation
                      .mutateAsync({
                        isLike: true,
                        postId: id,
                      })
                      .then(() => {
                        getPostsQuery.refetch();
                      });
                  }}
                >
                  <AiOutlineLike className="fill-inherit" />
                </button>
                <p className="text-xs font-semibold">{getPointsText(points)}</p>
                <button
                  className={`w-min p-1 text-2xl hover:scale-125 transition-transform ${status === 'authenticated' &&
                      postReactions[0]?.isLike === false
                      ? 'fill-red-600'
                      : ''
                    }`}
                  onClick={() => {
                    if (status === 'unauthenticated') {
                      showAlert(
                        'Please log in to perform this action.',
                        'danger'
                      );
                      return;
                    }
                    postReactionMutation
                      .mutateAsync({
                        isLike: false,
                        postId: id,
                      })
                      .then(() => {
                        getPostsQuery.refetch();
                      });
                  }}
                >
                  <AiOutlineDislike className="fill-inherit" />
                </button>
              </div>
              <button
                className="w-full text-left cursor-pointer border border-neutral-500 p-2 hover:bg-slate-100"
                onClick={() => {
                  router.push(`/posts/${id}`);
                }}
              >
                <p className="text-xs mb-2">Posted by: {user.name}</p>
                <h2 className="text-lg break-all font-semibold">{title}</h2>
                {media.map(({ externalId }) => (
                  <Image
                    key={externalId}
                    src={`https://pub-6a839333599b4921a1f2e53b7f0fdc23.r2.dev/${externalId}`}
                    alt={`Image for ${title}`}
                    height={200}
                    width={200}
                  />
                ))}
              </button>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default Home;

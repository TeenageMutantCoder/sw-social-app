import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Toast from '../../components/toast';

const Post: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const postId = router.query.id as string;
  const getPostQuery = trpc.useQuery(['posts.getPost', postId]);
  const deletePostMutation = trpc.useMutation(['posts.deletePost']);

  const deletePost = useCallback(() => {
    deletePostMutation.mutateAsync(postId).then(() => {
      router.push('/?deleted_post=true');
    });
  }, [deletePostMutation, postId, router]);

  if (getPostQuery.isLoading) return <p>Loading...</p>;

  if (getPostQuery.isError)
    return <p>There was an error while getting this post</p>;

  return (
    <>
      {deletePostMutation.isError && (
        <Toast alertType="error">
          There was an error while deleting this post.
        </Toast>
      )}
      <Link href="/" className="btn btn-outline">
        Go back to posts
      </Link>
      {session?.user?.id === getPostQuery.data?.user.id && (
        <div className="flex">
          <button className="btn" onClick={deletePost}>
            Delete
          </button>
        </div>
      )}
      <h1 className="text-xl mt-2">{getPostQuery.data?.title}</h1>
      <p className="text-sm">Written by {getPostQuery.data?.user.name}</p>
      <p className="my-5">{getPostQuery.data?.body}</p>
    </>
  );
};

export default Post;

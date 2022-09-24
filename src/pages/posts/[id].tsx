import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';

const Post: NextPage = () => {
  const router = useRouter();
  const postId = router.query.id as string;
  const getPostQuery = trpc.useQuery(['posts.getPost', postId]);

  if (getPostQuery.isLoading) return <p>Loading...</p>;

  if (getPostQuery.isError)
    return <p>There was an error while getting this post</p>;

  return (
    <>
      <Link href="/" className="btn btn-ghost">
        Go back to posts
      </Link>
      <h1 className="text-xl mt-2">{getPostQuery.data?.title}</h1>
      <p className="text-sm">Written by {getPostQuery.data?.user.name}</p>
      <p className="my-5">{getPostQuery.data?.body}</p>
    </>
  );
};

export default Post;

import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import Toast from '../../components/toast';
import { SubmitHandler, useForm } from 'react-hook-form';

type FormInput = {
  title: string;
  body: string;
};

const Post: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();
  const postId = router.query.id as string;
  const getPostQuery = trpc.useQuery(['posts.getPost', postId]);
  const deletePostMutation = trpc.useMutation(['posts.deletePost']);
  const updatePostMutation = trpc.useMutation(['posts.updatePost']);

  const deletePost = useCallback(() => {
    deletePostMutation.mutateAsync(postId).then(() => {
      router.push('/?deleted_post=true');
    });
  }, [deletePostMutation, postId, router]);

  const startEditingPost = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const stopEditingPost = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  const onSubmitHandler: SubmitHandler<FormInput> = useCallback(
    ({ title, body }) => {
      updatePostMutation.mutateAsync({ id: postId, title, body }).then(() => {
        reset();
        stopEditingPost();
        getPostQuery.refetch();
      });
    },
    [updatePostMutation, reset, postId, stopEditingPost, getPostQuery]
  );

  if (getPostQuery.isLoading) return <p>Loading...</p>;

  if (getPostQuery.isError)
    return <p>There was an error while getting this post</p>;

  if (isEditing)
    return (
      <form name="edit-post" onSubmit={handleSubmit(onSubmitHandler)}>
        <input
          className="form-control input input-bordered my-2"
          placeholder="Title"
          defaultValue={getPostQuery.data?.title}
          {...register('title', { required: true })}
        />
        <textarea
          className="form-control textarea textarea-bordered my-2"
          placeholder="Body"
          defaultValue={getPostQuery.data?.body}
          {...register('body', { required: true })}
        />
        <div className="flex gap-3 my-4">
          <input className="form-control btn btn-primary" type="submit" />
          <button
            className="form-control btn btn-outline btn-secondary"
            onClick={stopEditingPost}
          >
            Cancel
          </button>
          <input
            className="form-control btn btn-outline btn-accent"
            type="reset"
          />
        </div>
      </form>
    );

  return (
    <>
      {deletePostMutation.isError && (
        <Toast alertType="error">
          There was an error while deleting this post.
        </Toast>
      )}

      {updatePostMutation.isError && (
        <Toast alertType="error">
          There was an error while editing this post.
        </Toast>
      )}

      <Link href="/">
        <button className="btn btn-outline">Go back to posts</button>
      </Link>
      {session?.user?.id === getPostQuery.data?.user.id && (
        <div className="flex gap-3 my-3">
          <button className="btn" onClick={deletePost}>
            Delete
          </button>
          <button className="btn" onClick={startEditingPost}>
            Edit
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

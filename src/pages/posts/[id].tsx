import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import Alert from '../../components/alert';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import Button from '../../components/button';
import OwnerActions from '../../components/owner_actions';
import Reactions from '../../components/reactions';
import NewCommentForm from '../../components/new_comment_form';
import Comments from '../../components/comments';
import Form from '../../components/form';

type TFormInput = {
  title: string;
  body: string;
};

const Post: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<TFormInput>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: session, status } = useSession();
  const postId = router.query.id as string;
  const getPostQuery = trpc.useQuery(['posts.getPost', postId]);
  const deletePostMutation = trpc.useMutation(['posts.deletePost']);
  const updatePostMutation = trpc.useMutation(['posts.updatePost']);

  const refetchPost = useCallback(() => {
    getPostQuery.refetch();
  }, [getPostQuery]);

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

  const onSubmitHandler: SubmitHandler<TFormInput> = useCallback(
    ({ title, body }) => {
      updatePostMutation.mutateAsync({ id: postId, title, body }).then(() => {
        reset();
        stopEditingPost();
        refetchPost();
      });
    },
    [updatePostMutation, reset, postId, stopEditingPost, refetchPost]
  );

  const postReactionMutation = trpc.useMutation(['posts.reactToPost']);

  const upvotePost = useCallback(() => {
    postReactionMutation.mutateAsync({ isLike: true, postId }).then(() => {
      refetchPost();
    });
  }, [postReactionMutation, postId, refetchPost]);

  const downvotePost = useCallback(() => {
    postReactionMutation.mutateAsync({ isLike: false, postId }).then(() => {
      refetchPost();
    });
  }, [postReactionMutation, postId, refetchPost]);

  if (getPostQuery.isLoading) return <p>Loading...</p>;

  if (getPostQuery.isError)
    return <p>There was an error while getting this post</p>;

  if (isEditing)
    return (
      <Form
        submitHandler={handleSubmit(onSubmitHandler)}
        cancelHandler={stopEditingPost}
      >
        <input
          type="text"
          placeholder="Title"
          defaultValue={getPostQuery.data?.post.title}
          {...register('title', { required: true })}
        />
        <br />
        <textarea
          placeholder="Body"
          defaultValue={getPostQuery.data?.post.body}
          {...register('body', { required: true })}
        />
      </Form>
    );

  return (
    <>
      {deletePostMutation.isError && (
        <Alert alertType="danger">
          There was an error while deleting this post.
        </Alert>
      )}

      {updatePostMutation.isError && (
        <Alert alertType="danger">
          There was an error while editing this post.
        </Alert>
      )}

      <Button theme="outline-default">
        <Link href="/">Go back to posts</Link>
      </Button>

      <OwnerActions
        isOwner={session?.user?.id === getPostQuery.data?.post.user.id}
        deleteHandler={deletePost}
        editHandler={startEditingPost}
      />

      <h1 className="text-xl mt-2">{getPostQuery.data?.post.title}</h1>
      <p className="text-sm">Written by {getPostQuery.data?.post.user.name}</p>
      <p className="text-sm">{getPostQuery.data?.post.points} points</p>
      <p className="my-5">{getPostQuery.data?.post.body}</p>

      {status === 'authenticated' && (
        <>
          <Reactions
            upvote={upvotePost}
            downvote={downvotePost}
            isLiked={!!getPostQuery.data?.isLikedByCurrentUser}
            isDisliked={!!getPostQuery.data?.isDislikedByCurrentUser}
          />
          <NewCommentForm postId={postId} refetchPost={refetchPost} />
        </>
      )}

      <Comments
        postId={postId}
        comments={getPostQuery.data?.post.comments}
        refetchPost={refetchPost}
      />
    </>
  );
};

export default Post;

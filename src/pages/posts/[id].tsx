import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { showAlert } from '../../components/alert';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import Button from '../../components/button';
import OwnerActions from '../../components/owner-actions';
import Comments from '../../components/comments';
import Form from '../../components/form';
import Image from 'next/image';
import Spinner from '../../components/spinner';
import Reactions from '../../components/reactions';

type TFormInput = {
  title: string;
  body: string;
};

const Post: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<TFormInput>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();
  const postId = router.query.id as string;
  const getPostQuery = trpc.useQuery(['posts.getPost', postId]);
  const deletePostMutation = trpc.useMutation(['posts.deletePost']);
  const updatePostMutation = trpc.useMutation(['posts.updatePost']);
  const postReactionMutation = trpc.useMutation(['posts.reactToPost']);

  const navigateHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const refetchPost = useCallback(() => {
    getPostQuery.refetch();
  }, [getPostQuery]);

  const upvotePost = useCallback(() => {
    postReactionMutation
      .mutateAsync({
        isLike: true,
        postId,
      })
      .then(() => {
        getPostQuery.refetch();
      });
  }, [postReactionMutation, postId, getPostQuery]);

  const downvotePost = useCallback(() => {
    postReactionMutation
      .mutateAsync({
        isLike: false,
        postId,
      })
      .then(() => {
        getPostQuery.refetch();
      });
  }, [postReactionMutation, postId, getPostQuery]);

  const deletePost = useCallback(() => {
    deletePostMutation
      .mutateAsync(postId)
      .then(() => {
        router.push('/?deleted_post=true');
      })
      .catch(() => {
        showAlert('There was an error while deleting this post.', 'danger');
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
      updatePostMutation
        .mutateAsync({ id: postId, title, body })
        .then(() => {
          reset();
          stopEditingPost();
          refetchPost();
        })
        .catch(() => {
          showAlert('There was an error while updating this post.', 'danger');
        });
    },
    [updatePostMutation, reset, postId, stopEditingPost, refetchPost]
  );

  if (getPostQuery.isLoading) return <Spinner />;
  if (getPostQuery.isError)
    return (
      <div className="w-full h-full fixed top-0 left-0 flex flex-col justify-center items-center">
        <p className="text-center text-lg font-bold mb-2">
          There was an error while getting this post
        </p>
        <Button onClick={navigateHome}>Go back to posts</Button>
      </div>
    );

  if (isEditing)
    return (
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
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
          <textarea
            placeholder="Body"
            defaultValue={getPostQuery.data?.post.body}
            {...register('body', { required: true })}
          />
        </Form>
      </div>
    );

  return (
    <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
      <Button theme="outline-default" onClick={navigateHome}>
        Go back to posts
      </Button>
      <div className="flex my-2">
        <div className="border border-neutral-700">
          <Reactions
            isLiked={getPostQuery.data?.isLikedByCurrentUser ?? false}
            isDisliked={getPostQuery.data?.isDislikedByCurrentUser ?? false}
            downvote={downvotePost}
            upvote={upvotePost}
            points={getPostQuery.data?.post.points ?? 0}
          />
        </div>
        <div className="w-full border border-neutral-500 p-2 flex flex-col">
          <div className="flex justify-between">
            <p className="text-xs mb-2 break-all pr-2">
              Posted by: {getPostQuery.data?.post.user.name}
            </p>
            <OwnerActions
              isOwner={session?.user?.id === getPostQuery.data?.post.user.id}
              deleteHandler={deletePost}
              editHandler={startEditingPost}
            />
          </div>
          <h1 className="text-2xl max-w-full break-words">
            {getPostQuery.data?.post.title}
          </h1>
          <p className="my-5 max-w-full break-words">
            {getPostQuery.data?.post.body}
          </p>

          {getPostQuery.data?.post.media.map(({ externalId }) => (
            <Image
              key={externalId}
              src={`${process.env.NEXT_PUBLIC_S3_URL}/${externalId}`}
              alt={`Image for ${getPostQuery.data?.post.title}`}
              height={200}
              width={200}
            />
          ))}
        </div>
      </div>

      <Comments
        postId={postId}
        comments={getPostQuery.data?.post.comments}
        refetchPost={refetchPost}
      />
    </div>
  );
};

export default Post;

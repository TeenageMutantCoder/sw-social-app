import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Toast from '../../components/toast';
import { SubmitHandler, useForm } from 'react-hook-form';

type NewCommentFormProps = {
  postId: string;
  refetchPost: () => void;
  parentId?: string;
};

const NewCommentForm = ({
  postId,
  parentId,
  refetchPost,
}: NewCommentFormProps) => {
  const createComment = trpc.useMutation(['comments.createComment']);
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const onSubmitHandler: SubmitHandler<FormInput> = useCallback(
    ({ body }) => {
      createComment
        .mutateAsync({ body, parentCommentId: parentId, postId })
        .then(() => {
          reset();
          refetchPost();
        });
    },
    [parentId, postId, createComment, reset, refetchPost]
  );

  return (
    <form name="new-comment" onSubmit={handleSubmit(onSubmitHandler)}>
      <textarea
        className="form-control textarea textarea-bordered my-2"
        placeholder="Add your comment"
        {...register('body', { required: true })}
      />
      <input className="form-control btn btn-primary my-4" type="submit" />
    </form>
  );
};

type FormInput = {
  title: string;
  body: string;
};

type CommentProps = {
  body: string;
  user: { name: string; id: string };
  isDeleted: boolean;
  childComments: any[] | undefined;
  postId: string;
  commentId: string;
  refetchPost: () => void;
};
const Comment = ({
  body,
  user,
  isDeleted,
  childComments,
  postId,
  commentId,
  refetchPost,
}: CommentProps) => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const { data: session, status } = useSession();
  const deleteCommentMutation = trpc.useMutation(['comments.deleteComment']);
  const updateCommentMutation = trpc.useMutation(['comments.updateComment']);
  const deleteComment = useCallback(() => {
    deleteCommentMutation.mutateAsync(commentId).then(() => {
      refetchPost();
    });
  }, [refetchPost, deleteCommentMutation, commentId]);

  const [isEditing, setIsEditing] = useState(false);
  const startEditingComment = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const stopEditingComment = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  const onSubmitHandler: SubmitHandler<FormInput> = useCallback(
    ({ body }) => {
      updateCommentMutation.mutateAsync({ id: commentId, body }).then(() => {
        reset();
        stopEditingComment();
        refetchPost();
      });
    },
    [updateCommentMutation, reset, commentId, stopEditingComment, refetchPost]
  );

  return (
    <div className="ml-3">
      {isEditing ? (
        <form name="edit-post" onSubmit={handleSubmit(onSubmitHandler)}>
          <textarea
            className="form-control textarea textarea-bordered my-2"
            placeholder="Body"
            defaultValue={body}
            {...register('body', { required: true })}
          />
          <div className="flex gap-3 my-4">
            <input className="form-control btn btn-primary" type="submit" />
            <button
              className="form-control btn btn-outline btn-secondary"
              onClick={stopEditingComment}
            >
              Cancel
            </button>
            <input
              className="form-control btn btn-outline btn-accent"
              type="reset"
            />
          </div>
        </form>
      ) : (
        <>
          <p>{isDeleted ? 'deleted' : body}</p>
          <p>{isDeleted ? 'deleted' : user.name}</p>
        </>
      )}

      {!isDeleted && session?.user?.id === user.id && (
        <div className="flex gap-3 my-3">
          <button className="btn" onClick={deleteComment}>
            Delete
          </button>
          <button className="btn" onClick={startEditingComment}>
            Edit
          </button>
        </div>
      )}

      {status === 'authenticated' && (
        <NewCommentForm
          parentId={commentId}
          postId={postId}
          refetchPost={refetchPost}
        />
      )}
      {childComments?.map((child) => (
        <Comment
          key={child.id}
          body={child.body}
          isDeleted={child.deleted}
          user={child.user}
          childComments={child.children}
          postId={postId}
          commentId={child.id}
          refetchPost={refetchPost}
        />
      ))}
    </div>
  );
};

const Post: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
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

  const onSubmitHandler: SubmitHandler<FormInput> = useCallback(
    ({ title, body }) => {
      updatePostMutation.mutateAsync({ id: postId, title, body }).then(() => {
        reset();
        stopEditingPost();
        refetchPost();
      });
    },
    [updatePostMutation, reset, postId, stopEditingPost, refetchPost]
  );

  const commentTree = useMemo(() => {
    const comments = getPostQuery.data?.comments;
    const comment = getPostQuery.data?.comments[0];
    const parentId = comment?.parent?.id;
    type Comment = typeof comment;
    type ParentId = typeof parentId;
    type CommentWithChildren = Comment & {
      children?: Comment[];
    };
    type CommentsWithChildren = CommentWithChildren[];

    const getCommentTreeFromComments = (
      comments: CommentsWithChildren | undefined,
      parentId: ParentId
    ) => {
      if (comments === undefined || comments.length === 0) return [];
      const rootComments = comments.filter((comment) => {
        return comment.parent?.id === parentId;
      });
      const otherComments = comments.filter((comment) => {
        return comment.parent?.id !== parentId;
      });

      for (let comment of rootComments) {
        comment.children = getCommentTreeFromComments(
          otherComments,
          comment.id
        );
      }
      return rootComments;
    };

    return getCommentTreeFromComments(comments, undefined);
  }, [getPostQuery]);
  console.log(commentTree);

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

      {status === 'authenticated' && (
        <NewCommentForm postId={postId} refetchPost={refetchPost} />
      )}

      {commentTree.map((comment) => (
        <Comment
          key={comment.id}
          body={comment.body}
          user={comment.user}
          isDeleted={comment.deleted}
          childComments={comment.children}
          commentId={comment.id}
          postId={postId}
          refetchPost={refetchPost}
        />
      ))}
    </>
  );
};

export default Post;

import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { inferQueryOutput, trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Alert from '../../components/alert';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '../../components/button';

type TComment = inferQueryOutput<'posts.getPost'>['post']['comments'][0];
type TCommentWithChildren = TComment & {
  children?: TComment[];
};

const getCommentTreeFromComments = (
  comments: TCommentWithChildren[] | undefined,
  parentId: string | undefined
) => {
  if (comments === undefined || comments.length === 0) return [];
  const rootComments = comments.filter((comment) => {
    return comment.parent?.id === parentId;
  });
  const otherComments = comments.filter((comment) => {
    return comment.parent?.id !== parentId;
  });

  for (let comment of rootComments) {
    comment.children = getCommentTreeFromComments(otherComments, comment.id);
  }
  return rootComments;
};

type TReactionsProps = {
  upvote: () => void;
  downvote: () => void;
  isLiked: boolean;
  isDisliked: boolean;
};

const Reactions = ({
  upvote,
  downvote,
  isLiked,
  isDisliked,
}: TReactionsProps) => {
  return (
    <div className="flex my-3">
      <Button theme={isLiked ? 'green' : 'light'} onClick={upvote}>
        Upvote
      </Button>
      <Button theme={isDisliked ? 'red' : 'light'} onClick={downvote}>
        Downvote
      </Button>
    </div>
  );
};

type TNewCommentFormProps = {
  postId: string;
  refetchPost: () => void;
  parentId?: string;
};

const NewCommentForm = ({
  postId,
  parentId,
  refetchPost,
}: TNewCommentFormProps) => {
  const createComment = trpc.useMutation(['comments.createComment']);
  const { register, handleSubmit, reset } = useForm<TFormInput>();

  const onSubmitHandler: SubmitHandler<TFormInput> = useCallback(
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
        placeholder="Add your comment"
        {...register('body', { required: true })}
      />
      <br />
      <Button type="submit" />
    </form>
  );
};

type TFormInput = {
  title: string;
  body: string;
};

type TCommentProps = {
  body: string;
  user: { name: string; id: string };
  points: number;
  isLiked: boolean;
  isDisliked: boolean;
  isDeleted: boolean;
  childComments: TCommentWithChildren[] | undefined;
  postId: string;
  commentId: string;
  refetchPost: () => void;
};

const Comment = ({
  body,
  user,
  isLiked,
  isDisliked,
  points,
  isDeleted,
  childComments,
  postId,
  commentId,
  refetchPost,
}: TCommentProps) => {
  const { register, handleSubmit, reset } = useForm<TFormInput>();
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

  const onSubmitHandler: SubmitHandler<TFormInput> = useCallback(
    ({ body }) => {
      updateCommentMutation.mutateAsync({ id: commentId, body }).then(() => {
        reset();
        stopEditingComment();
        refetchPost();
      });
    },
    [updateCommentMutation, reset, commentId, stopEditingComment, refetchPost]
  );

  const commentReactionMutation = trpc.useMutation(['comments.reactToComment']);
  const upvoteComment = useCallback(() => {
    commentReactionMutation
      .mutateAsync({ isLike: true, commentId })
      .then(() => {
        refetchPost();
      });
  }, [commentReactionMutation, commentId, refetchPost]);
  const downvoteComment = useCallback(() => {
    commentReactionMutation
      .mutateAsync({ isLike: false, commentId })
      .then(() => {
        refetchPost();
      });
  }, [commentReactionMutation, commentId, refetchPost]);

  return (
    <div className="ml-3">
      {isEditing ? (
        <form name="edit-post" onSubmit={handleSubmit(onSubmitHandler)}>
          <textarea
            placeholder="Body"
            defaultValue={body}
            {...register('body', { required: true })}
          />
          <div className="flex gap-3 my-4">
            <Button type="submit" />
            <Button onClick={stopEditingComment}>Cancel</Button>
            <Button type="reset" />
          </div>
        </form>
      ) : (
        <>
          <p>{isDeleted ? 'deleted' : body}</p>
          <p>{isDeleted ? 'deleted' : user.name}</p>
          <p>{points} points</p>
        </>
      )}

      {!isDeleted && session?.user?.id === user.id && (
        <div className="flex gap-3 my-3">
          <Button onClick={deleteComment}>Delete</Button>
          <Button onClick={startEditingComment}>Edit</Button>
        </div>
      )}

      {status === 'authenticated' && (
        <>
          {!isDeleted && (
            <Reactions
              upvote={upvoteComment}
              downvote={downvoteComment}
              isLiked={isLiked}
              isDisliked={isDisliked}
            />
          )}
          <NewCommentForm
            parentId={commentId}
            postId={postId}
            refetchPost={refetchPost}
          />
        </>
      )}
      {childComments?.map((child) => (
        <Comment
          key={child.id}
          body={child.body}
          points={child.points}
          isLiked={!!child.commentReactions[0]?.isLike}
          isDisliked={
            child.commentReactions[0] !== undefined
              ? !child.commentReactions[0].isLike
              : false
          }
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

  const commentTree = useMemo(() => {
    const comments = getPostQuery.data?.post.comments;
    return getCommentTreeFromComments(comments, undefined);
  }, [getPostQuery]);

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
      <form name="edit-post" onSubmit={handleSubmit(onSubmitHandler)}>
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
        <div className="flex gap-3 my-4">
          <Button type="submit" />
          <Button onClick={stopEditingPost}>Cancel</Button>
          <Button type="reset" />
        </div>
      </form>
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

      <Button>
        <Link href="/">Go back to posts</Link>
      </Button>

      {session?.user?.id === getPostQuery.data?.post.user.id && (
        <div className="flex gap-3 my-3">
          <Button onClick={deletePost}>Delete</Button>
          <Button onClick={startEditingPost}>Edit</Button>
        </div>
      )}
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

      {commentTree.map((comment) => (
        <Comment
          key={comment.id}
          body={comment.body}
          isLiked={!!comment.commentReactions[0]?.isLike}
          isDisliked={
            comment.commentReactions[0] !== undefined
              ? !comment.commentReactions[0].isLike
              : false
          }
          user={comment.user}
          points={comment.points}
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

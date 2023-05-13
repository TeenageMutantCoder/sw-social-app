import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import Button from './button';
import Form from './form';
import Base64 from 'crypto-js/enc-base64';
import MD5 from 'crypto-js/md5';
import WordArray from 'crypto-js/lib-typedarrays';

type TNewPostFormInput = {
  title: string;
  body: string;
  media: FileList;
};

type TNewPostFormProps = {
  className: string;
  refetchPosts: () => void;
};

const NewPostForm = ({ className, refetchPosts }: TNewPostFormProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const createPost = trpc.useMutation(['posts.createPost']);
  const { client } = trpc.useContext();
  const { register, handleSubmit, reset } = useForm<TNewPostFormInput>();

  const onSubmitHandler: SubmitHandler<TNewPostFormInput> = useCallback(
    async ({ title, body, media }) => {
      const file = media.item(0);

      const mediaPayload = [];
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const wordArray = WordArray.create(arrayBuffer as any); // WordArray.create typing is wrong
        const md5 = MD5(wordArray);

        const base64EncodedMD5 = md5.toString(Base64);

        const { uploadUrl, externalId } = await client.query(
          'files.getPresignedUploadUrl',
          base64EncodedMD5
        );
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-MD5': base64EncodedMD5,
            'Content-Type': file.type as string,
          },
        });

        mediaPayload.push({
          externalId,
          contentType: file.type,
        });
      }

      createPost.mutateAsync({ title, body, media: mediaPayload }).then(() => {
        reset();
        setIsOpen(false);
        refetchPosts();
        router.push('/?created_post=true');
      });
    },
    [createPost, reset, refetchPosts, router, client]
  );

  const stopCreatingPost = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  if (!isOpen)
    return (
      <Button
        theme="light"
        className="w-full mb-5"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Create a new post
      </Button>
    );

  return (
    <Form
      submitHandler={handleSubmit(onSubmitHandler)}
      cancelHandler={stopCreatingPost}
      className={className}
    >
      <input
        type="text"
        placeholder="Title"
        {...register('title', { required: true })}
      />
      <textarea placeholder="Body" {...register('body', { required: true })} />
      <input type="file" accept="image/*" {...register('media')} />
    </Form>
  );
};

export default NewPostForm;

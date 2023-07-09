import { useSession } from 'next-auth/react';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { showAlert } from './alert';

type TReactionsProps = {
  upvote: () => void;
  downvote: () => void;
  points: number;
  isLiked: boolean;
  isDisliked: boolean;
  horizontal?: boolean;
};

const Reactions = ({
  upvote,
  downvote,
  points,
  isLiked,
  isDisliked,
  horizontal,
}: TReactionsProps) => {
  const { status } = useSession();
  return (
    <div className={`flex ${horizontal ? '' : 'flex-col w-12'} items-center`}>
      <button
        className={`w-min p-1 text-2xl hover:scale-125 transition-transform ${status === 'authenticated' && isLiked ? 'fill-green-500' : ''
          }`}
        onClick={() => {
          if (status === 'unauthenticated') {
            showAlert('Please log in to perform this action.', 'danger');
            return;
          }
          upvote();
        }}
      >
        <AiOutlineLike className="fill-inherit" />
      </button>
      <p className="text-xs font-semibold">{points}</p>
      <button
        className={`w-min p-1 text-2xl hover:scale-125 transition-transform ${status === 'authenticated' && isDisliked ? 'fill-red-600' : ''
          }`}
        onClick={() => {
          if (status === 'unauthenticated') {
            showAlert('Please log in to perform this action.', 'danger');
            return;
          }
          downvote();
        }}
      >
        <AiOutlineDislike className="fill-inherit" />
      </button>
    </div>
  );
};

export default Reactions;

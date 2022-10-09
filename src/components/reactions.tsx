import Button from './button';

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
    <div className="flex my-1">
      <Button theme={isLiked ? 'green' : 'light'} onClick={upvote}>
        Upvote
      </Button>
      <Button theme={isDisliked ? 'red' : 'light'} onClick={downvote}>
        Downvote
      </Button>
    </div>
  );
};

export default Reactions;

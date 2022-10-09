import Button from './button';

type TOwnerActionsProps = {
  isOwner: boolean;
  deleteHandler: () => void;
  editHandler: () => void;
};

const OwnerActions = ({
  isOwner,
  deleteHandler,
  editHandler,
}: TOwnerActionsProps) => {
  if (!isOwner) return null;

  return (
    <div className="flex gap-3 my-1">
      <Button theme="outline-red" onClick={deleteHandler}>
        Delete
      </Button>
      <Button theme="outline-yellow" onClick={editHandler}>
        Edit
      </Button>
    </div>
  );
};

export default OwnerActions;

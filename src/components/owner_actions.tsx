import Button from './button';

type TOwnerActionsProps = {
  deleteHandler: () => void;
  editHandler: () => void;
};

const OwnerActions = ({ deleteHandler, editHandler }: TOwnerActionsProps) => {
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

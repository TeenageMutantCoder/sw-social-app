import React from 'react';

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
    <div className="flex gap-2 h-fit">
      <button className="text-sm text-neutral-500 hover:text-neutral-300 font-semibold" onClick={deleteHandler}>
        Delete
      </button>
      <button className="text-sm text-neutral-500 hover:text-neutral-300 font-semibold" onClick={editHandler}>
        Edit
      </button>
    </div>
  );
};

export default OwnerActions;

import Button from './button';
import type { ReactNode } from 'react';

type TFormButtonsPorps = {
  cancelHandler: () => void;
  submitHandler: () => void;
  children: ReactNode;
};

const Form = ({
  children,
  submitHandler,
  cancelHandler,
}: TFormButtonsPorps) => {
  return (
    <form onSubmit={submitHandler}>
      {children}
      <div className="flex gap-3 my-4">
        <Button type="submit" />
        <Button theme="alternative" onClick={cancelHandler}>
          Cancel
        </Button>
        <Button theme="alternative" type="reset" />
      </div>
    </form>
  );
};

export default Form;

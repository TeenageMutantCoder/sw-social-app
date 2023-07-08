import Button from './button';
import type { ReactNode } from 'react';

type TFormButtonsPorps = {
  cancelHandler?: () => void;
  submitHandler: () => void;
  children: ReactNode;
  submitOnly?: boolean;
  className?: string;
  submitBtnClassName?: string;
};

const Form = ({
  children,
  submitHandler,
  cancelHandler,
  submitOnly,
  className,
  submitBtnClassName,
}: TFormButtonsPorps) => {
  return (
    <form
      className={`flex flex-col mx-auto gap-2 ${className}`}
      onSubmit={submitHandler}
    >
      {children}

      <div className="flex gap-2">
        <Button type="submit" className={submitBtnClassName} />
        {!submitOnly && (
          <>
            <Button theme="alternative" onClick={cancelHandler}>
              Cancel
            </Button>
            <Button theme="alternative" type="reset" />
          </>
        )}
      </div>
    </form>
  );
};

export default Form;

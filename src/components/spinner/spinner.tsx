import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import styles from './spinner.module.scss';

type TSpinnerProps = {
  className?: string
}
const Spinner = ({ className }: TSpinnerProps) => {
  return (
    <div className={`w-full h-full fixed top-0 left-0 flex items-center justify-center ${className}`}>
      <ImSpinner2 className={`w-32 h-32 ${styles.spinner}`} />
    </div>
  );
};

export default Spinner;

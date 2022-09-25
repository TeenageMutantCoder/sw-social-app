import type { ReactNode } from 'react';
import styles from './toast.module.scss';

type ToastProps = {
  children: ReactNode;
  alertType?: 'info' | 'success' | 'warning' | 'error';
};

const Toast = ({ children, alertType }: ToastProps) => {
  return (
    <div
      className={`toast toast-top toast-center w-max ${styles['fade-in-out']}`}
    >
      <div className={alertType ? `alert alert-${alertType}` : 'alert'}>
        {children}
      </div>
    </div>
  );
};

export default Toast;

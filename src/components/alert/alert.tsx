import { ReactNode } from 'react';
import styles from './alert.module.scss';

type TAlertProps = {
  children: ReactNode;
  alertType?: 'info' | 'danger' | 'success' | 'warning' | 'dark';
};

const DEFAULT_ALERT_TYPE = 'info';
const baseAlertClassNames = `w-max p-4 text-sm rounded-lg ${styles['fade-in-out']} ${styles['top-center']}`;
const alertTypeClassNames = {
  info: 'text-blue-700 bg-blue-100 dark:bg-blue-200 dark:text-blue-800',
  danger: 'text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800',
  success: 'text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800',
  warning:
    'text-yellow-700 bg-yellow-100 dark:bg-yellow-200 dark:text-yellow-800',
  dark: 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
};

const Alert = ({ children, alertType }: TAlertProps) => {
  const classNames = [
    baseAlertClassNames,
    alertTypeClassNames[alertType ?? DEFAULT_ALERT_TYPE],
  ];
  return (
    <div className={classNames.join(' ')} role="alert">
      {children}
    </div>
  );
};

export const showAlert = (
  text: string,
  type: TAlertProps['alertType'] = DEFAULT_ALERT_TYPE
) => {
  if (!window.swSocialApp.alerts) window.swSocialApp.alerts = [];
  if (window.swSocialApp.alerts.includes(text)) return;

  window.swSocialApp.alerts.push(text);
  const alertElement = document.createElement('div');
  const classNames = [baseAlertClassNames, alertTypeClassNames[type]];
  alertElement.className = classNames.join(' ');
  alertElement.innerText = text;
  alertElement.onanimationend = (e) => {
    if (e.animationName.includes('fade-out')) {
      alertElement.remove();
      window.swSocialApp.alerts = window.swSocialApp.alerts?.filter(
        (alert) => alert !== text
      ) ?? [];
    }
  };

  document.body.appendChild(alertElement);
};

export default Alert;

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, actions, footer, className, children, ...rest }) => (
  <div
    className={twMerge(
      'rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900',
      className
    )}
    {...rest}
  >
    {(title || actions) && (
      <div className="mb-3 flex items-center justify-between gap-2">
        {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
        {actions}
      </div>
    )}
    <div className="text-slate-700 dark:text-slate-200">{children}</div>
    {footer && <div className="mt-3 border-t pt-3 dark:border-slate-800">{footer}</div>}
  </div>
);

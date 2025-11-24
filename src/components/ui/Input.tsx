import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, hint, className, ...rest }) => (
  <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
    {label && <span>{label}</span>}
    <input
      className={twMerge(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/40',
        className
      )}
      {...rest}
    />
    {hint && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{hint}</span>}
  </label>
);

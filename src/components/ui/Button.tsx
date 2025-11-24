import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  as?: 'button' | 'a';
  href?: string;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:bg-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-500 disabled:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 disabled:bg-red-300 dark:bg-red-500 dark:hover:bg-red-400'
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  as = 'button',
  href,
  ...rest
}) => {
  const Component: any = as;
  return (
    <Component
      className={twMerge(
        'inline-flex items-center gap-2 rounded-lg font-semibold transition focus:outline-none',
        variants[variant],
        sizes[size],
        className
      )}
      href={href}
      {...rest}
    >
      {children}
    </Component>
  );
};

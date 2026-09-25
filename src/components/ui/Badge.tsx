import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  let variantStyles = 'bg-green-600 text-white border-transparent';
  if (variant === 'secondary') {
    variantStyles = 'bg-gray-100 text-gray-800 border-transparent';
  } else if (variant === 'destructive') {
    variantStyles = 'bg-red-100 text-red-800 border-transparent';
  } else if (variant === 'outline') {
    variantStyles = 'border-gray-300 text-gray-800';
  } else if (variant === 'success') {
    variantStyles = 'bg-emerald-100 text-emerald-800 border-transparent';
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

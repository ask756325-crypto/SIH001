import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    let variantStyles = 'bg-green-600 text-white hover:bg-green-700 shadow-sm';
    if (variant === 'outline') {
      variantStyles = 'border-2 border-green-600 text-green-700 bg-white hover:bg-green-50 shadow-sm';
    } else if (variant === 'ghost') {
      variantStyles = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
    } else if (variant === 'secondary') {
      variantStyles = 'bg-gray-100 text-gray-900 hover:bg-gray-200';
    } else if (variant === 'destructive') {
      variantStyles = 'bg-red-600 text-white hover:bg-red-700';
    }

    let sizeStyles = 'h-10 px-4 py-2 text-sm';
    if (size === 'sm') sizeStyles = 'h-8 px-3 text-xs';
    if (size === 'lg') sizeStyles = 'h-12 px-6 text-base';
    if (size === 'icon') sizeStyles = 'h-10 w-10 p-0 flex items-center justify-center';

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

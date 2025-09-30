import React, { forwardRef } from 'react';

type Variant = 'primary' | 'blue' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled,
    loading = false,
    className = '',
    onClick,
    type = 'button',
    ...rest
  },
  ref
) {
  const baseClasses =
    'font-semibold rounded-xl transition-all duration-200 focus:outline-none';

  const variantClasses: Record<Variant, string> = {
    primary: 'btn-primary',
    blue: 'btn-blue',
    ghost: 'hover:bg-white/10 text-current',
    link: 'link underline-offset-2',
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-5 py-3 text-lg',
  };

  const isDisabled = Boolean(disabled) || loading;

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
});

export { Button };
export type { ButtonProps };

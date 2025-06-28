import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { forwardRef } from 'react';

// Map our variants to MUI variants
const variantMap = {
  default: 'contained',
  outline: 'outlined',
  destructive: 'contained',
  ghost: 'text',
  link: 'text',
} as const;

// Map our sizes to MUI sizes
const sizeMap = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
} as const;

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'default',
  color = 'primary',
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  className = '',
  ...props
}, ref) => {
  // Handle destructive variant (maps to error color in MUI)
  const buttonColor = variant === 'destructive' ? 'error' : color;
  
  // Map our variant to MUI variant
  const buttonVariant = variantMap[variant] as MuiButtonProps['variant'];
  
  // Map our size to MUI size
  const buttonSize = sizeMap[size] as MuiButtonProps['size'];

  // Handle link variant specific styles
  const isLink = variant === 'link';
  const linkStyles = isLink ? {
    textDecoration: 'underline',
    textUnderlineOffset: 4,
    padding: 0,
    minWidth: 'auto',
  } : {};

  return (
    <MuiButton
      ref={ref}
      variant={buttonVariant}
      size={buttonSize}
      color={buttonColor}
      disabled={disabled || loading}
      className={className}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        ...linkStyles,
        ...(loading && {
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            visibility: 'hidden',
          },
        }),
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </MuiButton>
  );
});

Button.displayName = 'Button';

import { TextField, TextFieldProps, InputAdornment, useTheme, SxProps, Theme } from '@mui/material';
import { forwardRef } from 'react';

export interface InputProps extends Omit<TextFieldProps, 'variant' | 'size' | 'fullWidth'> {
  /**
   * Optional start adornment (icon or element)
   */
  startAdornment?: React.ReactNode;
  /**
   * Optional end adornment (icon or element)
   */
  endAdornment?: React.ReactNode;
  /**
   * Additional styles applied to the root element
   */
  rootSx?: SxProps<Theme>;
  /**
   * Size of the input
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  /**
   * Variant of the input
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled' | 'standard';
  /**
   * If `true`, the input will take up the full width of its container
   * @default true
   */
  fullWidth?: boolean;
  /**
   * If `true`, the input will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the input will indicate an error
   * @default false
   */
  error?: boolean;
  /**
   * The helper text content
   */
  helperText?: React.ReactNode;
  /**
   * The label content
   */
  label?: React.ReactNode;
  /**
   * If `true`, the label is displayed as required and the `input` element is required
   * @default false
   */
  required?: boolean;
  /**
   * The short hint displayed in the `input` before the user enters a value
   */
  placeholder?: string;
  /**
   * The value of the `input` element, required for a controlled component
   */
  value?: unknown;
  /**
   * The default value of the `input` element, used when the component is not controlled
   */
  defaultValue?: unknown;
  /**
   * Callback fired when the value is changed
   */
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /**
   * Name attribute of the `input` element
   */
  name?: string;
  /**
   * Type of the `input` element
   * @default 'text'
   */
  type?: string;
  /**
   * If `true`, the input will be read-only
   * @default false
   */
  readOnly?: boolean;
  /**
   * If `true`, the input will be auto-focused
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the input will be required and show an error if empty
   * @default false
   */
  requiredError?: boolean;
  /**
   * Custom error message to display when requiredError is true and the input is empty
   * @default 'This field is required'
   */
  requiredErrorMessage?: string;
}

/**
 * A customizable input field component built on top of Material-UI's TextField
 * with additional features and consistent styling.
 */
export const Input = forwardRef<HTMLDivElement, InputProps>(({
  startAdornment,
  endAdornment,
  rootSx,
  size = 'medium',
  variant = 'outlined',
  fullWidth = true,
  disabled = false,
  error = false,
  helperText,
  label,
  required = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  name,
  type = 'text',
  readOnly = false,
  autoFocus = false,
  requiredError = false,
  requiredErrorMessage = 'This field is required',
  className,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();
  const isError = error || (requiredError && !value);
  const errorMessage = isError ? (helperText || requiredErrorMessage) : helperText;

  // Handle start adornment
  const startAdornmentNode = startAdornment ? (
    <InputAdornment position="start">
      {startAdornment}
    </InputAdornment>
  ) : null;

  // Handle end adornment
  const endAdornmentNode = endAdornment ? (
    <InputAdornment position="end">
      {endAdornment}
    </InputAdornment>
  ) : null;

  return (
    <TextField
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      error={isError}
      helperText={errorMessage}
      label={label}
      required={required}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      name={name}
      type={type}
      InputProps={{
        readOnly,
        startAdornment: startAdornmentNode,
        endAdornment: endAdornmentNode,
        sx: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
          },
          ...sx,
        },
      }}
      InputLabelProps={{
        shrink: true,
      }}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400],
          },
        },
        ...rootSx,
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';

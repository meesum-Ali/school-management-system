import { TextField, TextFieldProps, useTheme, SxProps, Theme } from '@mui/material';
import { forwardRef } from 'react';

export interface TextareaProps extends Omit<TextFieldProps, 'variant' | 'multiline' | 'minRows' | 'maxRows'> {
  /**
   * Minimum number of rows to display when multiline option is set to true.
   * @default 3
   */
  minRows?: number | string;
  /**
   * Maximum number of rows to display when multiline option is set to true.
   */
  maxRows?: number | string;
  /**
   * Additional styles applied to the root element
   */
  rootSx?: SxProps<Theme>;
  /**
   * If `true`, the textarea element will be focused during the first mount.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: unknown;
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the label is displayed in an error state.
   * @default false
   */
  error?: boolean;
  /**
   * Helper text to display below the textarea.
   */
  helperText?: React.ReactNode;
  /**
   * The label content.
   */
  label?: React.ReactNode;
  /**
   * Name attribute of the `textarea` element.
   */
  name?: string;
  /**
   * Callback fired when the value is changed.
   */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  /**
   * The short hint displayed in the `textarea` before the user enters a value.
   */
  placeholder?: string;
  /**
   * If `true`, the label is displayed as required and the `textarea` element is required.
   * @default false
   */
  required?: boolean;
  /**
   * Number of rows to display when multiline option is set to true.
   */
  rows?: number | string;
  /**
   * The value of the `textarea` element, required for a controlled component.
   */
  value?: unknown;
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
 * A customizable textarea component built on top of Material-UI's TextField
 * with additional features and consistent styling.
 */
export const Textarea = forwardRef<HTMLDivElement, TextareaProps>(({
  minRows = 3,
  maxRows,
  rootSx,
  className,
  requiredError = false,
  requiredErrorMessage = 'This field is required',
  value,
  error: errorProp,
  helperText,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();
  const isError = errorProp || (requiredError && !value);
  const errorMessage = isError ? (helperText || requiredErrorMessage) : helperText;

  return (
    <TextField
      ref={ref}
      multiline
      minRows={minRows}
      maxRows={maxRows}
      variant="outlined"
      fullWidth
      error={isError}
      helperText={errorMessage}
      value={value}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
          },
        },
        ...sx,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

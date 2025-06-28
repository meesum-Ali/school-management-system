import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import { ReactNode, forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'onChange' | 'renderValue'> {
  /**
   * The options to display in the select dropdown
   */
  options: SelectOption[];
  /**
   * The label content
   */
  label?: string;
  /**
   * The value of the select element, required for a controlled component
   */
  value?: unknown;
  /**
   * The default value of the select element, used when the component is not controlled
   */
  defaultValue?: unknown;
  /**
   * Callback fired when the value is changed
   */
  onChange?: (value: unknown) => void;
  /**
   * If `true`, the select will be displayed in an error state
   * @default false
   */
  error?: boolean;
  /**
   * The helper text content to display below the select
   */
  helperText?: ReactNode;
  /**
   * If `true`, the label is displayed as required and the select element is required
   * @default false
   */
  required?: boolean;
  /**
   * If `true`, the select will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The short hint displayed in the select before the user enters a value
   */
  placeholder?: string;
  /**
   * The name attribute of the select element
   */
  name?: string;
  /**
   * Additional styles applied to the root element
   */
  rootSx?: SxProps<Theme>;
  /**
   * If `true`, the select will be required and show an error if empty
   * @default false
   */
  requiredError?: boolean;
  /**
   * Custom error message to display when requiredError is true and no value is selected
   * @default 'This field is required'
   */
  requiredErrorMessage?: string;
  /**
   * If `true`, the select will display a "None" option as the first option
   * @default false
   */
  showNoneOption?: boolean;
  /**
   * The label for the "None" option
   * @default 'None'
   */
  noneOptionLabel?: string;
}

/**
 * A customizable select component built on top of Material-UI's Select
 * with additional features and consistent styling.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(({
  options = [],
  label,
  value,
  defaultValue,
  onChange,
  error: errorProp,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  name,
  rootSx,
  requiredError = false,
  requiredErrorMessage = 'This field is required',
  showNoneOption = false,
  noneOptionLabel = 'None',
  className,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();
  const isError = errorProp || (requiredError && !value);
  const errorMessage = isError ? (helperText || requiredErrorMessage) : helperText;
  const hasValue = value !== '' && value !== undefined && value !== null;
  const displayNone = showNoneOption && !required;

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl
      variant="outlined"
      fullWidth
      error={isError}
      disabled={disabled}
      required={required}
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
        ...rootSx,
      }}
    >
      {label && (
        <InputLabel id={`${name || 'select'}-label`}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        ref={ref}
        labelId={label ? `${name || 'select'}-label` : undefined}
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        displayEmpty={!hasValue}
        label={label}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            minHeight: '1.4375em',
            padding: '16.5px 14px',
            '&.MuiInputBase-input': {
              height: 'auto',
              minHeight: '1.4375em',
            },
          },
          ...sx,
        }}
        {...props}
      >
        {displayNone && (
          <MenuItem value="">
            <em>{noneOptionLabel}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {errorMessage && (
        <FormHelperText>{errorMessage}</FormHelperText>
      )}
    </FormControl>
  );
});

Select.displayName = 'Select';

import { IconButton, IconButtonProps, SxProps, Theme } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { forwardRef } from 'react'

export interface PasswordToggleProps extends Omit<IconButtonProps, 'onClick'> {
  /**
   * If `true`, the password is visible
   */
  show: boolean
  /**
   * Callback fired when the visibility is toggled
   */
  onToggle: () => void
  /**
   * Additional styles applied to the root element
   */
  rootSx?: SxProps<Theme>
  /**
   * The size of the icon button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * The color of the icon
   * @default 'default'
   */
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
}

/**
 * A toggle button for showing/hiding password text
 */
export const PasswordToggle = forwardRef<
  HTMLButtonElement,
  PasswordToggleProps
>(
  (
    {
      show,
      onToggle,
      rootSx,
      size = 'medium',
      color = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onToggle()
    }

    return (
      <IconButton
        ref={ref}
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={handleClick}
        onMouseDown={(e) => e.preventDefault()}
        edge='end'
        size={size}
        color={color}
        className={className}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          ...rootSx,
        }}
        {...props}
      >
        {show ? (
          <VisibilityOff fontSize='inherit' />
        ) : (
          <Visibility fontSize='inherit' />
        )}
      </IconButton>
    )
  },
)

PasswordToggle.displayName = 'PasswordToggle'

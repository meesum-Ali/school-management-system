import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  contentSx?: SxProps<Theme>;
}

export const Card = ({
  children,
  title,
  actions,
  className = '',
  contentSx,
  ...props
}: CardProps) => (
  <MuiCard 
    className={className}
    sx={{
      borderRadius: 2,
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      ...props.sx
    }}
    {...props}
  >
    {title && (
      <CardHeader 
        title={title} 
        titleTypographyProps={{
          variant: 'h6',
          component: 'h2',
          sx: { 
            fontWeight: 600,
            lineHeight: 1.2
          }
        }}
        sx={{
          pb: 1,
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
          },
          '& .MuiCardHeader-title': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      />
    )}
    <CardContent 
      sx={{
        p: 3,
        '&:last-child': {
          pb: 3,
        },
        ...contentSx
      }}
    >
      {children}
    </CardContent>
    {actions && (
      <CardActions sx={{ p: 2, pt: 0 }}>
        {actions}
      </CardActions>
    )}
  </MuiCard>
);

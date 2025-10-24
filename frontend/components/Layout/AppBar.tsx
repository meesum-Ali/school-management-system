'use client';

import { useState } from 'react';
import { 
  AppBar as MuiAppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  Dashboard,
  School,
  Group,
  Book,
  CalendarMonth,
  Assessment,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link'; // Changed imports

interface AppBarProps {
  onMenuClick?: () => void;
  title?: string;
  sx?: SxProps<Theme>;
}

// Note: paths for menuItems might need to be prefixed with /admin if they are all admin paths
const menuItems = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard fontSize="small" /> },
  { title: 'Students', path: '/admin/students', icon: <Group fontSize="small" /> },
  { title: 'Teachers', path: '/admin/teachers', icon: <School fontSize="small" /> }, // Assuming /admin/teachers
  { title: 'Classes', path: '/admin/classes', icon: <Book fontSize="small" /> },
  { title: 'Schedule', path: '/admin/schedule', icon: <CalendarMonth fontSize="small" /> }, // Assuming /admin/schedule
  { title: 'Reports', path: '/admin/reports', icon: <Assessment fontSize="small" /> }, // Assuming /admin/reports
];

export const AppBar = ({ onMenuClick, title = 'School Management', sx }: AppBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Handle logout logic here (e.g., call auth context logout)
    handleMenuClose();
    router.push('/login'); // Changed from router.push
  };

  const handleProfileNavigation = (path: string) => {
    handleMenuClose();
    router.push(path); // Changed from router.push
  };

  const isMenuOpen = Boolean(anchorEl);
  const menuId = 'primary-account-menu';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>John Doe</Typography>
        <Typography variant="body2" color="text.secondary">
          admin@school.com
        </Typography>
      </Box>
      <Divider />
      {/* Assuming /admin/profile and /admin/settings for these routes */}
      <MenuItem onClick={() => handleProfileNavigation('/admin/profile')}>
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleProfileNavigation('/admin/settings')}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <MuiAppBar 
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          ...sx,
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              mr: 3
            }}
          >
            <School sx={{ mr: 1 }} />
            {title}
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2, gap: 1 }}>
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path} passHref legacyBehavior>
                <Button
                  startIcon={item.icon}
                  sx={{
                    color: pathname === item.path ? 'primary.main' : 'text.primary',
                    fontWeight: pathname === item.path ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={isMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  JD
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </MuiAppBar>
      {renderMenu}
    </>
  );
};

export default AppBar;

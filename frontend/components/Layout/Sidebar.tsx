import React, { useState, useContext, useEffect } from 'react'; // Added React
import { useLocation, Link } from 'react-router-dom'; // Changed imports
import { 
  Box, 
  Drawer, 
  Toolbar, 
  List, 
  Divider, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Collapse,
  useTheme,
  alpha,
  styled,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  ExpandLess,
  ExpandMore,
  MenuBook as MenuBookIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if necessary
import { UserRole } from '../../types/user'; // Adjust path if necessary

const drawerWidth = 240;

const StyledNavItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1.5),
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.24),
    },
  },
}));

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string; // Will be used as 'to' prop
  level?: number;
  exact?: boolean;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const NavItem = ({ icon, text, href, level = 0, exact = false, sx, onClick }: NavItemProps) => {
  const location = useLocation(); // Changed from useRouter
  const isActive = exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    // Use component={Link} and to={href} on StyledNavItem (ListItemButton)
    <StyledNavItem
      component={Link}
      to={href} // Changed from href on Link wrapper
      selected={isActive}
      sx={{
        pl: 2 + level * 2,
        ...sx,
      }}
      onClick={onClick}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          variant: 'body2',
          fontWeight: isActive ? 600 : 400,
        }}
      />
    </StyledNavItem>
  );
};

interface NavGroupProps {
  icon: React.ReactNode;
  text: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean; // Allow controlled open state
  onToggle?: () => void; // Allow parent to control toggle
}

const NavGroup = ({ icon, text, children, defaultOpen = false, isOpen, onToggle }: NavGroupProps) => {
  // If isOpen and onToggle are provided, this becomes a controlled component
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };
  
  return (
    <>
      <ListItemButton 
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent', // Or theme.palette.action.hover
          },
          // Add some padding/margin consistency if needed
          m: (theme) => theme.spacing(0.5, 1.5),
          p: (theme) => theme.spacing(1, 2),
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text} 
          primaryTypographyProps={{
            variant: 'subtitle2', // Slightly more prominent for group titles
            fontWeight: 500,
          }}
        />
        {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  width?: number | string;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, width = drawerWidth }) => {
  const { user } = useContext(AuthContext);
  const userRoles = user?.roles || [];
  const theme = useTheme();
  const location = useLocation(); // Changed from useRouter

  const canManageSchoolResources = userRoles.includes(UserRole.SCHOOL_ADMIN) || userRoles.includes(UserRole.SUPER_ADMIN);
  const isSuperAdmin = userRoles.includes(UserRole.SUPER_ADMIN);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    userManagement: false,
    academic: false,
    reports: false,
    settings: false,
  });

  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenGroups: Record<string, boolean> = {
      userManagement: currentPath.startsWith('/admin/users') ||
                      currentPath.startsWith('/admin/students') ||
                      currentPath.startsWith('/admin/teachers'),
      academic: currentPath.startsWith('/admin/classes') ||
                currentPath.startsWith('/admin/subjects'),
      reports: currentPath.startsWith('/admin/reports'),
      settings: currentPath.startsWith('/admin/settings'),
    };
    setOpenGroups(newOpenGroups);
  }, [location.pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const drawerContent = (
    <div>
      <Toolbar>
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            width: '100%',
            p: 1,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          component={Link} // Use react-router-dom Link
          to="/admin/dashboard" // Changed from href
        >
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            SchoolMS
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      <List component="nav" sx={{ p: 1 }}>
        <NavItem 
          icon={<DashboardIcon />} 
          text="Dashboard" 
          href="/admin/dashboard" 
          exact
        />

        {isSuperAdmin && (
          <NavItem 
            icon={<SchoolIcon />} 
            text="Schools" 
            href="/admin/schools" // Assuming /admin/schools
          />
        )}

        {canManageSchoolResources && (
          <>
            <NavGroup 
              icon={<PeopleIcon />} 
              text="User Management"
              isOpen={openGroups.userManagement}
              onToggle={() => toggleGroup('userManagement')}
            >
              <NavItem 
                icon={<PersonIcon fontSize="small" />} 
                text="All Users" 
                href="/admin/users"
                level={1}
              />
              <NavItem 
                icon={<PersonIcon fontSize="small" />} 
                text="Students" 
                href="/admin/students"
                level={1}
              />
              <NavItem 
                icon={<PersonIcon fontSize="small" />} 
                text="Teachers" 
                href="/admin/teachers" // Assuming /admin/teachers
                level={1}
              />
            </NavGroup>

            <NavGroup 
              icon={<ClassIcon />} 
              text="Academic"
              isOpen={openGroups.academic}
              onToggle={() => toggleGroup('academic')}
            >
              <NavItem 
                icon={<MenuBookIcon fontSize="small" />} 
                text="Classes" 
                href="/admin/classes"
                level={1}
              />
              <NavItem 
                icon={<MenuBookIcon fontSize="small" />} 
                text="Subjects" 
                href="/admin/subjects"
                level={1}
              />
            </NavGroup>

            <NavGroup 
              icon={<ReportIcon />} 
              text="Reports"
              isOpen={openGroups.reports}
              onToggle={() => toggleGroup('reports')}
            >
              <NavItem 
                icon={<AssessmentIcon fontSize="small" />} 
                text="Attendance" 
                href="/admin/reports/attendance" // Assuming /admin/reports/attendance
                level={1}
              />
              <NavItem 
                icon={<AssessmentIcon fontSize="small" />} 
                text="Grades" 
                href="/admin/reports/grades" // Assuming /admin/reports/grades
                level={1}
              />
            </NavGroup>
          </>
        )}

        {/* This spacer might not be needed or could be done differently */}
        {/* <Box sx={{ mt: 'auto' }} />  */}
        
        <NavGroup 
          icon={<SettingsIcon />} 
          text="Settings"
          isOpen={openGroups.settings}
          onToggle={() => toggleGroup('settings')}
        >
          <NavItem 
            icon={<SettingsIcon fontSize="small" />} 
            text="Account" 
            href="/admin/settings/account" // Assuming /admin/settings/account
            level={1}
          />
          <NavItem 
            icon={<SettingsIcon fontSize="small" />} 
            text="School" 
            href="/admin/settings/school" // Assuming /admin/settings/school
            level={1}
          />
        </NavGroup>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: width }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: width,
            borderRight: 'none', // Or theme.palette.divider
            // boxShadow: theme.shadows[8], // Optional: if you want shadow
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: width,
            borderRight: 'none', // Or theme.palette.divider
            // backgroundColor: theme.palette.background.default, // Or a specific sidebar color
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

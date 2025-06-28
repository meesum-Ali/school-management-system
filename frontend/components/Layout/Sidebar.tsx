import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
import { AuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

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
  href: string;
  level?: number;
  exact?: boolean;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const NavItem = ({ icon, text, href, level = 0, exact = false, sx, onClick }: NavItemProps) => {
  const router = useRouter();
  const isActive = exact ? router.pathname === href : router.pathname.startsWith(href);

  return (
    <Link href={href} passHref>
      <StyledNavItem
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
    </Link>
  );
};

interface NavGroupProps {
  icon: React.ReactNode;
  text: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NavGroup = ({ icon, text, children, defaultOpen = false }: NavGroupProps) => {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <>
      <ListItemButton 
        onClick={() => setOpen(!open)}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text} 
          primaryTypographyProps={{
            variant: 'body2',
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
  const router = useRouter();

  const canManageSchoolResources = userRoles.includes(UserRole.SCHOOL_ADMIN) || userRoles.includes(UserRole.SUPER_ADMIN);
  const isSuperAdmin = userRoles.includes(UserRole.SUPER_ADMIN);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-expand the current section based on the current route
    const currentPath = router.pathname;
    if (currentPath.startsWith('/admin/users') || 
        currentPath.startsWith('/admin/students') || 
        currentPath.startsWith('/admin/teachers')) {
      setOpenGroups(prev => ({ ...prev, userManagement: true }));
    } else if (currentPath.startsWith('/admin/classes') || 
               currentPath.startsWith('/admin/subjects')) {
      setOpenGroups(prev => ({ ...prev, academic: true }));
    } else if (currentPath.startsWith('/admin/reports')) {
      setOpenGroups(prev => ({ ...prev, reports: true }));
    } else if (currentPath.startsWith('/admin/settings')) {
      setOpenGroups(prev => ({ ...prev, settings: true }));
    }
  }, [router.pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const drawer = (
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
          component={Link}
          href="/admin/dashboard"
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
            href="/admin/schools"
          />
        )}

        {canManageSchoolResources && (
          <>
            <NavGroup 
              icon={<PeopleIcon />} 
              text="User Management"
              defaultOpen={openGroups.userManagement}
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
                href="/admin/teachers"
                level={1}
              />
            </NavGroup>

            <NavGroup 
              icon={<ClassIcon />} 
              text="Academic"
              defaultOpen={openGroups.academic}
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
              defaultOpen={openGroups.reports}
            >
              <NavItem 
                icon={<AssessmentIcon fontSize="small" />} 
                text="Attendance" 
                href="/admin/reports/attendance"
                level={1}
              />
              <NavItem 
                icon={<AssessmentIcon fontSize="small" />} 
                text="Grades" 
                href="/admin/reports/grades"
                level={1}
              />
            </NavGroup>
          </>
        )}

        <Box sx={{ mt: 'auto' }} />
        
        <NavGroup 
          icon={<SettingsIcon />} 
          text="Settings"
          defaultOpen={openGroups.settings}
        >
          <NavItem 
            icon={<SettingsIcon fontSize="small" />} 
            text="Account" 
            href="/admin/settings/account"
            level={1}
          />
          <NavItem 
            icon={<SettingsIcon fontSize="small" />} 
            text="School" 
            href="/admin/settings/school"
            level={1}
          />
        </NavGroup>
      </List>
    </div>
  );

  return (
    <>
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
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: width,
            borderRight: 'none',
            backgroundColor: theme.palette.background.default,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;

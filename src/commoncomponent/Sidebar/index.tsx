import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { GiMagnet } from "react-icons/gi";
import Groups2Icon from '@mui/icons-material/Groups2';
import Logo from '../../../public/assets/images/logo.webp';
import User from '../../../public/assets/images/usermale.png';
import Image from 'next/image';
import { Avatar, Button, Menu, MenuItem, Tooltip } from '@mui/material';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useRouter } from 'next/router';
import Api from '@/utils/helper/api';
import { useAppDispatch, useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice, setAuthUserData, setIsAdmin, setIsLoggedIn, setOrganization } from '../../../redux/slices/authSlice';
import { deleteCookie } from 'cookies-next';
import { GiTeamIdea } from "react-icons/gi";
import { IUserData } from '@/utils/interfaces/user';
import { UserRoles } from '@/utils/helper/constants';
import { Form, InputGroup } from 'react-bootstrap';
import Styles from '../../styles/header.module.scss';
import { IoSearch } from "react-icons/io5";
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { TbArtboard, TbMessageExclamation, TbReportMoney, TbSteam } from 'react-icons/tb';
import { deepOrange, green } from '@mui/material/colors';
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));


const pages = ['Products', 'Pricing', 'Blog'];
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const router = useRouter(); // Initialize useRouter
  const api = new Api();
  const dispatch = useAppDispatch();
  const authSlice = useAppSelector(getAuthSlice);
  const userData: IUserData | null = authSlice ? authSlice?.userData : null;
  const isAdmin = ((userData?.role === UserRoles.ADMIN) || (userData?.role === UserRoles.SUPER_ADMIN));

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Define the icons and links for each navigation item
  const topLinks = [

    { text: 'Employee', icon: <Groups2Icon />, href: '/employee' },
    { text: 'Team', icon: <GiTeamIdea size={16} />, href: '/team' },
    { text: 'Inventory', icon: <Inventory2Icon />, href: '/inventory' },
    { text: 'Leads', icon: <GiMagnet size={24} />, href: '/leads' },
    { text: 'Payment', icon: <TbReportMoney />, href: '/payment' },
    { text: 'Invoices', icon: <ReceiptIcon />, href: '/invoice' },
  ].filter(link => !(!isAdmin && (link.text === 'Employee' || link.text === 'Team')));


  const topLinksDashBoard = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },

  ].filter(link => !(!isAdmin && (link.text === 'Employee' || link.text === 'Team')));
  const topLinksSetting = [
    { text: 'Sources', icon: <TbArtboard />, href: '/sources' },
    { text: 'Lost Reason', icon: <TbMessageExclamation />, href: '/lostreason' },
    { text: 'Contact Stages', icon: <TbSteam />, href: '/contactstages' },

  ].filter(link => !(!isAdmin && (link.text === 'Employee' || link.text === 'Team')));

  const handleLogout = async () => {
    try {
      const response = await api.post(`/logout`);
      if (response.data?.success) {
        handleCloseUserMenu();
        dispatch(setAuthUserData(null));
        dispatch(setIsLoggedIn(false));
        dispatch(setIsAdmin(false));
        dispatch(setOrganization(null));
        deleteCookie('organizationId');
        router.push('/login');
      }
    } catch (error) {
      const err = error as Error;
    }
  }

  const handleNavigate = (url: string) => {
    router.push(url);
  }

  const settings = [
    { label: 'Profile', link: '' },
    { label: 'Account', link: '' },
    { label: 'Dashboard', link: '' },
    ...(userData?.role === UserRoles.ADMIN ? [{ label: 'Organization Setting', handler: () => handleNavigate('/organization-setting') }] : []),
    { label: 'Logout', handler: handleLogout }
  ];


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" color='info' open={open}>
        <Toolbar sx={{
          borderBottom: 4, borderColor: "#EB8317", minHeight: 50, '@media (min-width:600px)': {
            minHeight: 50,

          },
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                marginRight: 5,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {/* {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: '#10375C', display: 'block' }}
              >
                {page}
              </Button>
            ))} */}

            <div className={Styles.searchBox}>
              <InputGroup>
                <Form.Control placeholder='Search' />
                <InputGroup.Text>
                  <IoSearch color="#6F6F6F" />
                </InputGroup.Text>
              </InputGroup>
            </div>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              {/* <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar variant="rounded" sx={{width:30,height:30}} alt="Remy Sharp" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQanlasPgQjfGGU6anray6qKVVH-ZlTqmuTHw&s" />
              </IconButton> */}
              <Stack direction="row" spacing={2}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  onClick={handleOpenUserMenu}
                >
                  <Avatar alt="Remy Sharp" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQanlasPgQjfGGU6anray6qKVVH-ZlTqmuTHw&s" />
                </StyledBadge>

              </Stack>
            </Tooltip>
            <Menu
              sx={{ mt: '25px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting?.label} onClick={setting.handler}>
                  <Typography sx={{ textAlign: 'center' }}>{setting?.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer className='sideNav' variant="permanent" open={open}>
        <DrawerHeader className='logoBox'>
          <Link href="/">
            <Image alt="Logo" width={250} height={68} src={Logo} />
          </Link>
          {/* <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton> */}
        </DrawerHeader>

        <div className='sideNavUser'>
          <Stack direction="row" spacing={2}>
            <Avatar sx={{ bgcolor: "#EB8316", paddingX: "4px" }} variant="rounded">
              <Image alt="User" src={User} />
            </Avatar>
            <div className="">
              <h2 className='heading'>{userData?.name || ''}</h2>
              <p className='text'>{userData?.role}</p>
            </div>
          </Stack>
        </div>
        <Divider sx={{ opacity: .5, borderColor: "#10375C", my: 2 }} />
        <List>
          <h2 className='sideNavHeading'>CRM</h2>
          {topLinksDashBoard.map((link) => {
            const isActive = router.pathname === link.href; // Check if the link is active
            return (
              <ListItem className='sidenavItem' key={link.text} disablePadding sx={{ display: 'block' }}>
                <Link href={link.href} passHref>
                  <ListItemButton
                    className='sidenavItemBtn'
                    sx={[
                      {
                        minHeight: 40,
                        px: 2.5,
                        backgroundColor: isActive
                          ? theme.palette.secondary.main
                          : 'inherit',
                        color: isActive
                          ? theme.palette.primary.contrastText
                          : 'inherit',
                        '&:hover': {
                          backgroundColor: isActive
                            ? theme.palette.secondary.main
                            : theme.palette.primary.dark,
                          // Text color changes on hover (if you want)
                          color: theme.palette.primary.contrastText,
                        },
                      },
                      open
                        ? { justifyContent: 'initial' }
                        : { justifyContent: 'center' },
                    ]}
                  >
                    <ListItemIcon

                      sx={[
                        {
                          minWidth: 0,
                          maxWidth: 20,
                          maxHeight: 20,
                          justifyContent: 'center',
                          // Default icon color
                          color: theme.palette.primary.main,
                          // Change icon color when parent ListItemButton is hovered
                          '.MuiListItemButton-root:hover &': {
                            color: theme.palette.primary.contrastText,
                          },
                          // Optional: Also change when active
                          ...(isActive && {
                            color: theme.palette.primary.contrastText,
                          }),
                        },
                        open ? { mr: 3 } : { mr: 'auto' },
                      ]}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.text}
                      sx={[

                        open
                          ? {
                            opacity: 1,
                            fontSize: 14
                          }
                          : {
                            opacity: 0,
                          },
                      ]}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
          {topLinks.map((link) => {
            const isActive = router.pathname === link.href; // Check if the link is active
            return (
              <ListItem className='sidenavItem' key={link.text} disablePadding sx={{ display: 'block' }}>
                <Link href={link.href} passHref>
                  <ListItemButton
                    className='sidenavItemBtn'
                    sx={[
                      {
                        minHeight: 40,
                        px: 2.5,
                        backgroundColor: isActive
                          ? theme.palette.secondary.main
                          : 'inherit',
                        color: isActive
                          ? theme.palette.primary.contrastText
                          : 'inherit',
                        '&:hover': {
                          backgroundColor: isActive
                            ? theme.palette.secondary.main
                            : theme.palette.primary.dark,
                          // Text color changes on hover (if you want)
                          color: theme.palette.primary.contrastText,
                        },
                      },
                      open
                        ? { justifyContent: 'initial' }
                        : { justifyContent: 'center' },
                    ]}
                  >
                    <ListItemIcon

                      sx={[
                        {
                          minWidth: 0,
                          maxWidth: 20,
                          maxHeight: 20,
                          justifyContent: 'center',
                          // Default icon color
                          color: theme.palette.primary.main,
                          // Change icon color when parent ListItemButton is hovered
                          '.MuiListItemButton-root:hover &': {
                            color: theme.palette.primary.contrastText,
                          },
                          // Optional: Also change when active
                          ...(isActive && {
                            color: theme.palette.primary.contrastText,
                          }),
                        },
                        open ? { mr: 3 } : { mr: 'auto' },
                      ]}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.text}
                      sx={[

                        open
                          ? {
                            opacity: 1,
                            fontSize: 14
                          }
                          : {
                            opacity: 0,
                          },
                      ]}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
          {
            isAdmin && (
              <>
                <h2 className='sideNavHeading'>CRM Setting</h2>
                {topLinksSetting.map((link) => {
                  const isActive = router.pathname === link.href; // Check if the link is active
                  return (
                    <ListItem className='sidenavItem' key={link.text} disablePadding sx={{ display: 'block' }}>
                      <Link href={link.href} passHref>
                        <ListItemButton
                          className='sidenavItemBtn'
                          sx={[
                            {
                              minHeight: 40,
                              px: 2.5,
                              backgroundColor: isActive
                                ? theme.palette.secondary.main
                                : 'inherit',
                              color: isActive
                                ? theme.palette.primary.contrastText
                                : 'inherit',
                              '&:hover': {
                                backgroundColor: isActive
                                  ? theme.palette.secondary.main
                                  : theme.palette.primary.dark,
                                // Text color changes on hover (if you want)
                                color: theme.palette.primary.contrastText,
                              },
                            },
                            open
                              ? { justifyContent: 'initial' }
                              : { justifyContent: 'center' },
                          ]}
                        >
                          <ListItemIcon

                            sx={[
                              {
                                minWidth: 0,
                                maxWidth: 20,
                                maxHeight: 20,
                                justifyContent: 'center',
                                // Default icon color
                                color: theme.palette.primary.main,
                                // Change icon color when parent ListItemButton is hovered
                                '.MuiListItemButton-root:hover &': {
                                  color: theme.palette.primary.contrastText,
                                },
                                // Optional: Also change when active
                                ...(isActive && {
                                  color: theme.palette.primary.contrastText,
                                }),
                              },
                              open ? { mr: 3 } : { mr: 'auto' },
                            ]}
                          >
                            {link.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={link.text}
                            sx={[

                              open
                                ? {
                                  opacity: 1,
                                  fontSize: 14
                                }
                                : {
                                  opacity: 0,
                                },
                            ]}
                          />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  );
                })}
              </>
            )
          }

        </List>
      </Drawer>
    </Box>
  );
}
import { AppBar, IconButton, Toolbar, Typography, Box, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeControl } from '../../App';
import { useTheme } from '@mui/material/styles';
import logoUrlD from '../../assets/images/Logo-Dark.png';
import logoUrlL from '../../assets/images/Logo-Light.png';
import { useNavigate } from 'react-router-dom';

type Props = {
  onMenuClick: () => void;
  title?: string;
  isMobile: boolean;
};
export default function TopBar({ onMenuClick, isMobile, title }: Props): React.ReactElement {
  const navigate = useNavigate();
  const { toggleTheme } = useThemeControl();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <AppBar position="fixed" color="primary" elevation={0} enableColorOnDark>
      <Toolbar sx={{ gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1 }}>
          {isMobile && (
            <Tooltip title={'Menu'}>
              <IconButton
                edge="start"
                color="inherit"
                sx={{ color: 'rgba(2, 30, 70)' }}
                onClick={onMenuClick}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              variant: 'h6',
              flexGrow: 1,
              transition: 'color 0.2 ease transform 0.1 ease ',
              transformOrigin: 'left center',
              '&:hover': { color: 'aqua' },
              '&:active': { transform: 'scale(0.98)' },
            }}
            onClick={() => navigate('/overview')}
            noWrap
          >
            <img
              src={isDark ? logoUrlD : logoUrlL}
              alt="Logo"
              style={{ height: 40, marginRight: 8 }}
            />
            {title ?? 'PPE-Watcher'}
          </Typography>
        </Box>
        {!isMobile && (
          <Typography variant="h6" sx={{ flex: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>
            The Best System for Your Factory Security
          </Typography>
        )}

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {' '}
          <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
            <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

import { AppBar, IconButton, Toolbar, Typography, Box, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeControl } from '../../App';
import { useTheme } from '@mui/material/styles';
import logoUrlD from '../../assets/images/Logo-Dark.png';
import logoUrlL from '../../assets/images/Logo-Light.png';

type Props = {
  onMenuClick: () => void;
  title?: string;
  isMobile: boolean;
};
export default function TopBar({ onMenuClick, isMobile, title }: Props): React.ReactElement {
  const { toggleTheme } = useThemeControl();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <AppBar position="fixed" color="primary" elevation={0} enableColorOnDark>
      <Toolbar sx={{ gap: 1 }}>
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
          }}
          noWrap
        >
          <img
            src={isDark ? logoUrlD : logoUrlL}
            alt="Logo"
            style={{ height: 40, marginRight: 8 }}
          />
          {title ?? 'PPE-Watcher'}
        </Typography>
        <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

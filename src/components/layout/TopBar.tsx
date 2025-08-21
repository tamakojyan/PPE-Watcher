import { AppBar, IconButton, Toolbar, Typography, Box, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
type Props = {
  onMenuClick: () => void;
  onToggleTheme?: () => void;
  title?: string;
};
export default function TopBar({ onMenuClick, onToggleTheme, title }: Props): React.ReactElement {
  return (
    <Box
      sx={{
        height: 64,
        bgcolor: 'primary.main',
        display: 'flex',
        color: 'white',
        alignItems: 'center',
        px: 2,
      }}
    ></Box>
  );
}

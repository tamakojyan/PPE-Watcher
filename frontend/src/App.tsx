import router from './app/routes';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, createTheme, useMediaQuery } from '@mui/material';
import { useState, useMemo } from 'react';
import { createContext, useContext } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export const ThemeControlContext = createContext<{ toggleTheme: () => void } | null>(null);
export const useThemeControl = () => {
  const ctx = useContext(ThemeControlContext);
  if (!ctx) throw new Error('useThemeControl must be used  within ThemeControlContext.provider ');
  return ctx;
};
export default function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = useMemo(
    () => createTheme({ palette: { mode: isDark ? 'dark' : 'light' } }),
    [isDark]
  );
  const toggleTheme = () => setIsDark((p) => !p);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeControlContext.Provider value={{ toggleTheme }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeControlContext.Provider>
    </ThemeProvider>
  );
}

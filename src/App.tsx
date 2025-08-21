import router from './app/routes';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, createTheme } from '@mui/material';
import { useState, useMemo } from 'react';
import { createContext, useContext } from 'react';

export const ThemeControlContext = createContext(toggleTheme:()=>void);

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = useMemo(
    () => createTheme({ palette: { mode: isDark ? 'dark' : 'light' } }),
    [isDark]
  );
  const toggleTheme = () => setIsDark((p) => !p);

  return(  <ThemeProvider theme={theme}>
      <CssBaseline/>
      <RouterProvider router={router} />;
    </ThemeProvider>)

}

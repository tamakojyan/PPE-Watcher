import { createBrowserRouter, RouteObject } from 'react-router-dom';
import AppShell from 'components/layout/AppShell';
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';
import History from 'pages/History';
import NotFound from 'pages/NotFound';
import Settings from 'pages/Settings';

const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'history', element: <History /> },
      { path: 'settings', element: <Settings /> },
      { path: 'notfound', element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes);
export default router;

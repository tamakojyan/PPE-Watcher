import { createBrowserRouter, RouteObject, Navigate } from 'react-router-dom';

import Overview from 'pages/Dashboard/Overview';
import Alerts from 'pages/Dashboard/Alerts';

import SearchViolations from 'pages/History/SearchViolations';
import Trends from 'pages/History/Trends';
import Notifications from 'pages/History/Notifications';
import Bookmarks from 'pages/History/Bookmarks';

import AlertsSettings from 'pages/Settings/AlertsSettings';
import Contacts from 'pages/Settings/Contacts';
import SenderConfig from 'pages/Settings/SenderConfig';
import Security from 'pages/Settings/Security';

import AppShell from 'components/layout/AppShell';
import Login from 'pages/Login';
import NotFound from 'pages/NotFound';

const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },

      // Dashboard group (flat URLs)
      { path: 'overview', element: <Overview /> },
      { path: 'alerts', element: <Alerts /> },

      // History group (flat URLs)
      { path: 'violations', element: <SearchViolations /> },
      { path: 'trends', element: <Trends /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'bookmarks', element: <Bookmarks /> },

      // Settings group (flat URLs)
      { path: 'alerts-settings', element: <AlertsSettings /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'sender', element: <SenderConfig /> },
      { path: 'security', element: <Security /> },

      { path: '*', element: <NotFound /> },
    ],
  },
];

export default createBrowserRouter(routes);

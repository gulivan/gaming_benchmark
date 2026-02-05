import { createBrowserRouter } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/games/:gameId',
    lazy: async () => {
      const { GamePage } = await import('../pages/GamePage');
      return { Component: GamePage };
    },
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

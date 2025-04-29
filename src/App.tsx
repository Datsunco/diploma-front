import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useRefreshTokenMutation, useGetCurrentUserQuery } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import NetworkStatus from '@/components/NetworkStatus';
import AppRoutes from '@/routes';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { refreshToken } = useAppSelector(state => state.auth);
  
  const [refreshTokenMutation] = useRefreshTokenMutation();
  
  // Автоматически запрашиваем данные текущего пользователя, если есть токен
  const { isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !refreshToken
  });

  // Эффект для проверки токена и получения данных пользователя
  useEffect(() => {
    const initAuth = async () => {
      if (refreshToken) {
        try {
          const result = await refreshTokenMutation(refreshToken).unwrap();
          // dispatch(setCredentials({ token: result.token, refreshToken: result.refresh_token }));
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    };

    initAuth();
  }, [refreshToken, refreshTokenMutation, dispatch]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AppRoutes />
        <Toaster />
        <NetworkStatus />
      </Router>
    </ThemeProvider>
  );
};

export default App;
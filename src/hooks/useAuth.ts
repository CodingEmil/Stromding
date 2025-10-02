import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { LoginCredentials, RegisterCredentials, AuthState } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Prüfe beim Laden, ob ein Benutzer angemeldet ist
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setAuthState({
      user: currentUser,
      isAuthenticated: !!currentUser
    });
    setIsLoading(false);
  }, []);

  // Anmelden
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      const user = await authService.login(credentials);
      setAuthState({
        user,
        isAuthenticated: true
      });
    } catch (error) {
      throw error;
    }
  }, []);

  // Registrieren
  const register = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
    try {
      await authService.register(credentials);
      // Nach Registrierung automatisch anmelden
      await login({ email: credentials.email, password: credentials.password });
    } catch (error) {
      throw error;
    }
  }, [login]);

  // Abmelden
  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false
    });
  }, []);

  // Benutzer löschen
  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!authState.user) return;
    
    try {
      await authService.deleteUser(authState.user.id);
      logout();
    } catch (error) {
      throw error;
    }
  }, [authState.user, logout]);

  return {
    ...authState,
    isLoading,
    login,
    register,
    logout,
    deleteAccount
  };
};

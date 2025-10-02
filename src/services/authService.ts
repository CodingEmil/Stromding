import type { User, StoredUser, LoginCredentials, RegisterCredentials, UserData } from '../types/auth';

// Sichere Hash-Funktion für Passwörter mit Fallback
async function hashPassword(password: string): Promise<string> {
  const saltedPassword = password + 'stromtarif_salt_2024';
  
  try {
    // Versuche moderne crypto.subtle API
    if (crypto && crypto.subtle && crypto.subtle.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.warn('crypto.subtle nicht verfügbar, verwende Fallback:', error);
  }
  
  // Fallback: Einfacher Hash für Kompatibilität
  let hash = 0;
  for (let i = 0; i < saltedPassword.length; i++) {
    const char = saltedPassword.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Lokaler Storage für Benutzer
const USERS_STORAGE_KEY = 'stromtarif_users';
const CURRENT_USER_KEY = 'stromtarif_current_user';
const USER_DATA_PREFIX = 'stromtarif_user_data_';

// Safe localStorage wrapper für GitHub Pages
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage nicht verfügbar:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('LocalStorage nicht verfügbar:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorage nicht verfügbar:', error);
    }
  }
};

export class AuthService {
  // Alle Benutzer aus localStorage laden
  private getStoredUsers(): StoredUser[] {
    const users = safeLocalStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Benutzer in localStorage speichern
  private saveUsers(users: StoredUser[]): void {
    safeLocalStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Benutzerdaten für einen spezifischen Benutzer laden
  getUserData(userId: string): UserData {
    const data = safeLocalStorage.getItem(USER_DATA_PREFIX + userId);
    return data ? JSON.parse(data) : {
      tarife: [],
      settings: {
        defaultVerbrauch: 3500,
        theme: 'dark' as const
      }
    };
  }

  // Benutzerdaten für einen spezifischen Benutzer speichern
  saveUserData(userId: string, data: UserData): void {
    safeLocalStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(data));
  }

  // Benutzer registrieren
  async register(credentials: RegisterCredentials): Promise<User> {
    const users = this.getStoredUsers();
    
    // Prüfen ob E-Mail bereits existiert
    if (users.find(u => u.email === credentials.email)) {
      throw new Error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits');
    }

    // Neuen Benutzer erstellen
    const passwordHash = await hashPassword(credentials.password);
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: credentials.email,
      name: credentials.name,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    // Benutzer speichern
    users.push(newUser);
    this.saveUsers(users);

    // Leere Benutzerdaten initialisieren
    this.saveUserData(newUser.id, {
      tarife: [],
      settings: {
        defaultVerbrauch: 3500,
        theme: 'dark'
      }
    });

    // User-Objekt ohne Passwort zurückgeben
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt
    };

    return user;
  }

  // Benutzer anmelden
  async login(credentials: LoginCredentials): Promise<User> {
    const users = this.getStoredUsers();
    const passwordHash = await hashPassword(credentials.password);
    
    const storedUser = users.find(u => 
      u.email === credentials.email && u.passwordHash === passwordHash
    );

    if (!storedUser) {
      throw new Error('Ungültige E-Mail-Adresse oder Passwort');
    }

    const user: User = {
      id: storedUser.id,
      email: storedUser.email,
      name: storedUser.name,
      createdAt: storedUser.createdAt
    };

    // Aktuellen Benutzer speichern
    safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  }

  // Aktuell angemeldeten Benutzer laden
  getCurrentUser(): User | null {
    const user = safeLocalStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Benutzer abmelden
  logout(): void {
    safeLocalStorage.removeItem(CURRENT_USER_KEY);
  }

  // Benutzer löschen (mit allen Daten)
  async deleteUser(userId: string): Promise<void> {
    const users = this.getStoredUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
    
    // Benutzerdaten löschen
    safeLocalStorage.removeItem(USER_DATA_PREFIX + userId);
    
    // Falls der gelöschte Benutzer aktuell angemeldet ist, abmelden
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.logout();
    }
  }

  // GitHub-Modus setzen (Platzhalter-Implementierung)
  setGitHubMode(enabled: boolean, token?: string): void {
    // Hier könnte die GitHub-Integration implementiert werden
    // Aktuell nur ein Platzhalter für zukünftige Funktionalität
    console.log(`GitHub-Modus ${enabled ? 'aktiviert' : 'deaktiviert'}`, token ? 'mit Token' : 'ohne Token');
  }
}

export const authService = new AuthService();

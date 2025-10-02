import React, { useState } from 'react';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await onLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Validierung für Registrierung
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Die Passwörter stimmen nicht überein');
        }
        if (formData.password.length < 6) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
        }
        if (!formData.name.trim()) {
          throw new Error('Bitte geben Sie Ihren Namen ein');
        }

        await onRegister({
          email: formData.email,
          password: formData.password,
          name: formData.name.trim()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Fehler zurücksetzen wenn Benutzer tippt
    if (error) setError(null);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="glass rounded-2xl p-8 border border-slate-700/50 backdrop-blur-xl w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <span className="text-6xl animate-pulse-glow">⚡</span>
            <div className="absolute inset-0 text-6xl animate-pulse-glow opacity-30 blur-sm">⚡</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            StromTarif Vergleich
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Melden Sie sich an, um Ihre Tarife zu verwalten' : 'Erstellen Sie ein Konto für Ihre persönlichen Tarife'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                👤 Ihr Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Max Mustermann"
              />
            </div>
          )}

          <div className="group">
            <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-purple-400 transition-colors">
              📧 E-Mail-Adresse *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
              placeholder="ihre@email.de"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-cyan-400 transition-colors">
              🔒 Passwort *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
              placeholder={isLogin ? "Ihr Passwort" : "Mindestens 6 Zeichen"}
            />
          </div>

          {!isLogin && (
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-green-400 transition-colors">
                🔒 Passwort bestätigen *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Passwort wiederholen"
              />
            </div>
          )}

          {error && (
            <div className="glass rounded-lg p-4 border border-red-500/30 bg-red-500/10 animate-fadeInUp">
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-lg">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-500 transform ${
              isSubmitting 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 scale-95 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
            } text-white overflow-hidden`}
          >
            <div className="relative flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Anmeldung läuft...' : 'Registrierung läuft...'}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {isLogin ? '🔓' : '🎯'}
                  </span>
                  <span>{isLogin ? 'Anmelden' : 'Registrieren'}</span>
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    ⚡
                  </span>
                </>
              )}
            </div>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-slate-400 hover:text-slate-200 transition-colors duration-300 text-sm"
            >
              {isLogin 
                ? 'Noch kein Konto? Jetzt registrieren' 
                : 'Bereits ein Konto? Zur Anmeldung'
              }
            </button>
          </div>
        </form>

        {/* Demo-Hinweis */}
        <div className="mt-6 glass rounded-lg p-4 border border-blue-500/30 bg-blue-500/10">
          <div className="flex items-start gap-2 text-blue-300">
            <span className="text-lg">💡</span>
            <div className="text-sm">
              <p className="font-medium mb-1">Demo-Modus</p>
              <p className="text-blue-200/80">
                Ihre Daten werden nur lokal in Ihrem Browser gespeichert. 
                Keine Übertragung an externe Server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

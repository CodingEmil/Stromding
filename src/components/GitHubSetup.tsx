import React, { useState } from 'react';
import { githubDataService } from '../services/githubDataService';

interface GitHubSetupProps {
  onComplete: () => void;
}

export const GitHubSetup: React.FC<GitHubSetupProps> = ({ onComplete }) => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'token' | 'success'>('info');

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);

    try {
      // Token setzen
      githubDataService.setToken(token);
      
      // Testen ob Token funktioniert
      await githubDataService.ensureDataBranch();
      
      // GitHub-Modus ist jetzt aktiv (Token wurde gesetzt)
      console.log('GitHub-Modus aktiviert');
      
      setStep('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token-Validierung fehlgeschlagen');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkip = () => {
    // Lokalen Modus verwenden (kein Token gesetzt)
    console.log('Lokaler Modus aktiviert');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="glass rounded-2xl p-8 border border-slate-700/50 backdrop-blur-xl w-full max-w-2xl relative z-10 animate-fadeInUp">
        {step === 'info' && (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                GitHub-Synchronisation
              </h2>
              <p className="text-slate-400 text-lg">
                Verbinden Sie Ihr GitHub-Repository, um Ihre Daten geräteübergreifend zu synchronisieren
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="glass rounded-lg p-4 border border-green-500/30 bg-green-500/10">
                <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                  <span>✅</span> Vorteile der GitHub-Synchronisation
                </h3>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>• Zugriff auf Ihre Tarife von jedem Gerät</li>
                  <li>• Automatische Datensicherung</li>
                  <li>• Versionskontrolle Ihrer Daten</li>
                  <li>• Kostenlose Nutzung mit GitHub</li>
                </ul>
              </div>

              <div className="glass rounded-lg p-4 border border-blue-500/30 bg-blue-500/10">
                <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <span>ℹ️</span> Was Sie benötigen
                </h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Ein GitHub Personal Access Token</li>
                  <li>• Berechtigung zum Lesen/Schreiben des Repositories</li>
                  <li>• Internet-Verbindung für Synchronisation</li>
                </ul>
              </div>

              <div className="glass rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/10">
                <h3 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                  <span>🔒</span> Datenschutz
                </h3>
                <p className="text-yellow-200 text-sm">
                  Ihre Daten werden in einem separaten Branch gespeichert und sind nur für Sie sichtbar.
                  Das Token wird sicher in Ihrem Browser gespeichert.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('token')}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
              >
                GitHub konfigurieren
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-4 glass border border-slate-600/50 hover:border-slate-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300"
              >
                Lokal verwenden
              </button>
            </div>
          </>
        )}

        {step === 'token' && (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                GitHub Token eingeben
              </h2>
              <p className="text-slate-400">
                Erstellen Sie einen Personal Access Token in Ihren GitHub-Einstellungen
              </p>
            </div>

            <div className="glass rounded-lg p-4 border border-blue-500/30 bg-blue-500/10 mb-6">
              <h3 className="text-blue-300 font-semibold mb-2">So erstellen Sie einen Token:</h3>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                <li>Gehen Sie zu GitHub → Settings → Developer settings → Personal access tokens</li>
                <li>Klicken Sie auf "Generate new token (classic)"</li>
                <li>Wählen Sie "repo" Berechtigung aus</li>
                <li>Kopieren Sie den Token hierher</li>
              </ol>
            </div>

            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 font-mono"
                  required
                />
              </div>

              {error && (
                <div className="glass rounded-lg p-4 border border-red-500/30 bg-red-500/10">
                  <div className="flex items-center gap-2 text-red-300">
                    <span>⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-6 py-3 glass border border-slate-600/50 hover:border-slate-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={isValidating || !token}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isValidating || !token
                      ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white hover:scale-105'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validiere Token...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Verbinden</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
              >
                Erstmal lokal verwenden (später konfigurierbar)
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Erfolgreich verbunden!
              </h2>
              <p className="text-slate-400 mb-6">
                Ihre Daten werden jetzt automatisch mit GitHub synchronisiert
              </p>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

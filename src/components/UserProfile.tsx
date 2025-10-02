import React, { useState } from 'react';
import type { User } from '../types/auth';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onDeleteAccount }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      console.error('Fehler beim Löschen des Kontos:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-100">{user.name}</h3>
          <p className="text-slate-400">{user.email}</p>
          <p className="text-slate-500 text-sm">Mitglied seit {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onLogout}
          className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 rounded-lg text-slate-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          <span>Konto löschen</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl max-w-md mx-4 animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Konto wirklich löschen?</h3>
              <p className="text-slate-400 text-sm">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Tarife und Daten werden permanent gelöscht.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 rounded-lg text-slate-300 hover:text-white transition-all duration-300"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`flex-1 px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDeleting
                    ? 'bg-red-600/50 cursor-not-allowed text-red-200'
                    : 'bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 text-red-300 hover:text-red-200'
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-200 border-t-transparent rounded-full animate-spin"></div>
                    <span>Lösche...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Endgültig löschen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

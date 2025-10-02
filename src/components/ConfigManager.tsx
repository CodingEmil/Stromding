import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigManagerProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({ onExport, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileImport(e.target.files[0]);
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      setMessage(null);
      await onImport(file);
      setMessage({ type: 'success', text: 'Konfiguration erfolgreich importiert!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Fehler beim Importieren' 
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleExport = () => {
    try {
      onExport();
      setMessage({ type: 'success', text: 'Konfiguration exportiert!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Fehler beim Exportieren' 
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 border border-slate-700/50 animate-fadeInUp backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          Konfiguration verwalten
        </h2>
        <p className="text-slate-400 text-lg">
          Exportieren und importieren Sie Ihre Stromtarife
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Konfiguration exportieren
          </h3>
          <p className="text-slate-400">
            Laden Sie Ihre aktuellen Stromtarife als JSON-Datei herunter.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Tarife exportieren
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Konfiguration importieren
          </h3>
          <p className="text-slate-400">
            Laden Sie eine JSON-Datei mit Stromtarifen hoch, um Ihre Konfiguration zu ersetzen.
          </p>
          
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-200 mb-2">
              JSON-Datei hier ablegen
            </h4>
            <p className="text-slate-400 mb-4">
              oder klicken Sie hier zum Durchsuchen
            </p>
            <div className="text-sm text-slate-500">
              Unterstützte Formate: .json
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
          <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            Hinweise
          </h4>
          <ul className="text-slate-400 space-y-2 text-sm">
            <li>• Beim Import werden alle aktuellen Tarife ersetzt</li>
            <li>• Die JSON-Datei enthält alle Ihre Tarifdaten</li>
            <li>• Exportierte Dateien können mit anderen geteilt werden</li>
            <li>• Alle Daten werden lokal in Ihrem Browser gespeichert</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
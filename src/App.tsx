import { useState } from 'react';
import { TarifFormular } from './components/TarifFormular';
import { TarifListe } from './components/TarifListe';
import { TarifVergleichChart } from './components/TarifVergleichChart';
import { ConfigManager } from './components/ConfigManager';
import { useStromtarife } from './hooks/useStromtarife';
import type { Stromtarif } from './types';

function App() {
  const { tarife, tarifHinzufuegen, tarifAktualisieren, tarifLoeschen, exportTarife, importTarife } = useStromtarife();
  const [activeTab, setActiveTab] = useState<'eingabe' | 'liste' | 'vergleich' | 'config'>('eingabe');
  const [beispielVerbrauch, setBeispielVerbrauch] = useState(3500);
  const [bearbeitungsTarif, setBearbeitungsTarif] = useState<Stromtarif | null>(null);

  const tabs = [
    { id: 'eingabe' as const, label: bearbeitungsTarif ? 'Tarif bearbeiten' : 'Tarif hinzufügen', icon: '⚡', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'liste' as const, label: 'Meine Tarife', icon: '📊', gradient: 'from-purple-500 to-pink-500' },
    { id: 'vergleich' as const, label: 'Vergleichsdiagramm', icon: '📈', gradient: 'from-green-500 to-emerald-500' },
    { id: 'config' as const, label: 'Konfiguration', icon: '⚙️', gradient: 'from-orange-500 to-red-500' },
  ];

  const handleTarifBearbeiten = (tarif: Stromtarif) => {
    setBearbeitungsTarif(tarif);
    setActiveTab('eingabe');
  };

  const handleTarifSpeichern = (tarifDaten: Omit<Stromtarif, 'id'>) => {
    if (bearbeitungsTarif) {
      tarifAktualisieren(bearbeitungsTarif.id, tarifDaten);
      setBearbeitungsTarif(null);
    } else {
      tarifHinzufuegen(tarifDaten);
    }
    setActiveTab('liste');
  };

  const handleBearbeitungAbbrechen = () => {
    setBearbeitungsTarif(null);
    setActiveTab('liste');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 to-transparent rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Stromtarif Vergleich
                  </h1>
                  <p className="text-sm text-slate-400">Intelligent. Einfach. Transparent.</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'eingabe' && (
            <TarifFormular
              onTarifHinzufuegen={handleTarifSpeichern}
              bearbeitungsTarif={bearbeitungsTarif}
              onBearbeitungAbbrechen={handleBearbeitungAbbrechen}
            />
          )}

          {activeTab === 'liste' && (
            <div className="space-y-8">
              <TarifListe 
                tarife={tarife} 
                onTarifLoeschen={tarifLoeschen} 
                onTarifBearbeiten={handleTarifBearbeiten}
                beispielVerbrauch={beispielVerbrauch}
                onVerbrauchChange={setBeispielVerbrauch}
              />
            </div>
          )}

          {activeTab === 'vergleich' && (
            <TarifVergleichChart 
              tarife={tarife}
              maxVerbrauch={8000}
            />
          )}

          {activeTab === 'config' && (
            <ConfigManager
              onExport={exportTarife}
              onImport={importTarife}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
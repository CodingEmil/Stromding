import { useState } from 'react';
import { TarifFormular } from './components/TarifFormular';
import { TarifListe } from './components/TarifListe';
import { TarifVergleichChart } from './components/TarifVergleichChart2';
import { useStromtarife } from './hooks/useStromtarife';
import type { Stromtarif } from './types';
import './App.css';

function App() {
  const { tarife, tarifHinzufuegen, tarifAktualisieren, tarifLoeschen, alleTarifeLoeschen } = useStromtarife();
  const [activeTab, setActiveTab] = useState<'eingabe' | 'liste' | 'vergleich'>('eingabe');
  const [beispielVerbrauch, setBeispielVerbrauch] = useState(3500);
  const [bearbeitungsTarif, setBearbeitungsTarif] = useState<Stromtarif | null>(null);

  const tabs = [
    { id: 'eingabe', label: bearbeitungsTarif ? 'Tarif bearbeiten' : 'Tarif hinzufügen', icon: '⚡', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'liste', label: 'Meine Tarife', icon: '📊', gradient: 'from-purple-500 to-pink-500' },
    { id: 'vergleich', label: 'Vergleichsdiagramm', icon: '📈', gradient: 'from-green-500 to-emerald-500' },
  ] as const;

  const handleTarifBearbeiten = (tarif: Stromtarif) => {
    setBearbeitungsTarif(tarif);
    setActiveTab('eingabe');
  };

  const handleBearbeitungAbbrechen = () => {
    setBearbeitungsTarif(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-slate-700/50 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 animate-fadeInUp">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-5xl animate-pulse-glow">⚡</span>
                <div className="absolute inset-0 text-5xl animate-pulse-glow opacity-50 blur-sm">⚡</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                  StromTarif Vergleich
                </h1>
                <p className="text-slate-400 text-sm">Finden Sie den günstigsten Stromtarif für Ihren Verbrauch</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                    ${activeTab === tab.id 
                      ? `bg-gradient-to-r ${tab.gradient} shadow-lg shadow-blue-500/25 text-white` 
                      : 'glass hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:animate-bounce">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="animate-fadeInUp delay-300">
          {/* Tarif Eingabe */}
          {activeTab === 'eingabe' && (
            <div className="space-y-8">
              <TarifFormular 
                onTarifHinzufuegen={tarifHinzufuegen}
                bearbeitungsTarif={bearbeitungsTarif}
                onTarifAktualisieren={tarifAktualisieren}
                onBearbeitungAbbrechen={handleBearbeitungAbbrechen}
              />
            </div>
          )}

          {/* Tarif Liste */}
          {activeTab === 'liste' && (
            <div className="space-y-8">
              <TarifListe 
                tarife={tarife} 
                onTarifLoeschen={tarifLoeschen} 
                onAlleTarifeLoeschen={alleTarifeLoeschen}
                onTarifBearbeiten={handleTarifBearbeiten}
              />
            </div>
          )}

          {/* Vergleichsdiagramm */}
          {activeTab === 'vergleich' && (
            <div className="space-y-8">
              {/* Verbrauchseingabe */}
              <div className="glass p-6 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">Verbrauchsanalyse</h3>
                    <p className="text-slate-400">Geben Sie Ihren jährlichen Stromverbrauch ein für die Kostenberechnung</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label htmlFor="verbrauch" className="text-slate-300 font-medium whitespace-nowrap">
                      Jahresverbrauch:
                    </label>
                    <div className="relative">
                      <input
                        id="verbrauch"
                        type="number"
                        value={beispielVerbrauch}
                        onChange={(e) => setBeispielVerbrauch(Number(e.target.value))}
                        className="input-glow w-32 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                                 text-slate-100 text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                                 transition-all duration-300"
                        min="0"
                        step="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                        kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <TarifVergleichChart tarife={tarife} beispielVerbrauch={beispielVerbrauch} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button - Back to top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 
                   rounded-full shadow-lg shadow-blue-500/25 text-white text-xl 
                   hover:shadow-xl hover:shadow-blue-500/40 hover:scale-110 
                   transition-all duration-300 z-20 animate-bounce-slow"
        aria-label="Nach oben scrollen"
      >
        ↑
      </button>
    </div>
  );
}

export default App;

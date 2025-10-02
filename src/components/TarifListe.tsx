import React from 'react';
import type { Stromtarif } from '../types';
import { berechneTarifkosten } from '../types';

interface TarifListeProps {
  tarife: Stromtarif[];
  onTarifLoeschen: (id: string) => void;
  onAlleTarifeLoeschen: () => void;
  onTarifBearbeiten?: (tarif: Stromtarif) => void;
  beispielVerbrauch?: number;
  onVerbrauchChange?: (verbrauch: number) => void;
}

export const TarifListe: React.FC<TarifListeProps> = ({
  tarife,
  onTarifLoeschen,
  onAlleTarifeLoeschen,
  onTarifBearbeiten,
  beispielVerbrauch = 3500,
  onVerbrauchChange
}) => {
  if (tarife.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-slate-700/50 animate-fadeInUp backdrop-blur-xl">
        <div className="text-6xl mb-6 animate-pulse">📊</div>
        <h3 className="text-2xl font-semibold text-slate-300 mb-4">
          Keine Tarife vorhanden
        </h3>
        <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
          Fügen Sie Ihren ersten Stromtarif hinzu, um mit dem intelligenten Vergleich zu beginnen.
        </p>
      </div>
    );
  }

  // Tarife nach Kosten bei Beispielverbrauch sortieren
  const tarifeNachKosten = [...tarife].sort((a, b) => {
    const kostenA = berechneTarifkosten(a, beispielVerbrauch);
    const kostenB = berechneTarifkosten(b, beispielVerbrauch);
    return kostenA - kostenB;
  });

  const guenstigsterTarif = tarifeNachKosten[0];
  const guenstigsteKosten = berechneTarifkosten(guenstigsterTarif, beispielVerbrauch);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header mit Verbrauchseingabe */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ihre Stromtarife
              </h3>
              <p className="text-slate-400 mt-1">
                Sortiert nach Kosten bei {beispielVerbrauch.toLocaleString()} kWh/Jahr
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Verbrauchseingabe */}
            <div className="flex items-center gap-3">
              <label htmlFor="verbrauch-liste" className="text-slate-300 font-medium whitespace-nowrap text-sm">
                Jahresverbrauch:
              </label>
              <div className="relative">
                <input
                  id="verbrauch-liste"
                  type="number"
                  value={beispielVerbrauch}
                  onChange={(e) => onVerbrauchChange?.(Number(e.target.value))}
                  className="w-32 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                           text-slate-100 text-center focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                           transition-all duration-300 text-sm"
                  min="0"
                  step="100"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">
                  kWh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spartipp */}
      {tarife.length > 1 && (
        <div className="glass rounded-2xl p-6 border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 animate-slideInRight backdrop-blur-xl neon-blue">
          <div className="flex items-start gap-3">
            <span className="text-3xl animate-pulse">💡</span>
            <div>
              <h4 className="font-semibold text-blue-300 text-lg mb-2">Intelligenter Spartipp</h4>
              <p className="text-slate-300 leading-relaxed">
                Bei einem Verbrauch von <span className="text-blue-400 font-semibold">{beispielVerbrauch.toLocaleString()} kWh/Jahr</span> können Sie mit dem günstigsten Tarif bis zu{' '}
                <span className="text-green-400 font-bold text-xl">
                  {(berechneTarifkosten(tarifeNachKosten[tarifeNachKosten.length - 1], beispielVerbrauch) - guenstigsteKosten).toFixed(2)} €
                </span>{' '}
                pro Jahr sparen! 🚀
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tarif Cards */}
      <div className="space-y-4">
        {tarifeNachKosten.map((tarif, index) => {
          const jahreskosten = berechneTarifkosten(tarif, beispielVerbrauch);
          const mehrkosten = jahreskosten - guenstigsteKosten;
          const istGuenstigster = index === 0;

          return (
            <div
              key={tarif.id}
              className={`group glass rounded-2xl p-6 border transition-all duration-500 hover:scale-[1.02] animate-slideInRight backdrop-blur-xl ${
                istGuenstigster 
                  ? 'border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10 neon-green' 
                  : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <h4 className="font-bold text-slate-100 text-xl group-hover:text-white transition-colors">
                        {tarif.name}
                      </h4>
                    </div>
                    {istGuenstigster && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse neon-green">
                        🏆 Günstigster Tarif
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 text-lg">⚡</span>
                        <span className="text-slate-400 text-sm">Arbeitspreis</span>
                      </div>
                      <div className="font-bold text-blue-300 text-lg">
                        {tarif.arbeitspreis.toFixed(4)} €/kWh
                      </div>
                    </div>
                    
                    <div className="glass rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400 text-lg">💰</span>
                        <span className="text-slate-400 text-sm">Grundpreis</span>
                      </div>
                      <div className="font-bold text-green-300 text-lg">
                        {tarif.grundpreis.toFixed(2)} €/Monat
                      </div>
                    </div>
                    
                    {tarif.praemie > 0 && (
                      <div className="glass rounded-lg p-3 border border-slate-600/30">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-purple-400 text-lg">🎁</span>
                          <span className="text-slate-400 text-sm">Prämie</span>
                        </div>
                        <div className="font-bold text-purple-300 text-lg">
                          {tarif.praemie.toFixed(2)} €
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="glass rounded-xl p-4 border border-slate-600/30 mb-4">
                    <div className={`text-3xl font-bold mb-1 ${istGuenstigster ? 'text-green-300' : 'text-slate-200'}`}>
                      {jahreskosten.toFixed(2)} €
                    </div>
                    <div className="text-slate-400 text-sm mb-2">
                      pro Jahr bei {beispielVerbrauch.toLocaleString()} kWh
                    </div>
                    {!istGuenstigster && mehrkosten > 0 && (
                      <div className="text-red-400 text-sm font-medium">
                        +{mehrkosten.toFixed(2)} € teurer
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {onTarifBearbeiten && (
                      <button
                        onClick={() => onTarifBearbeiten(tarif)}
                        className="group/btn glass px-4 py-2 rounded-lg text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
                        title="Tarif bearbeiten"
                      >
                        <span className="group-hover/btn:scale-110 transition-transform duration-200 inline-block">✏️</span>
                      </button>
                    )}
                    <button
                      onClick={() => onTarifLoeschen(tarif.id)}
                      className="group/btn glass px-4 py-2 rounded-lg text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
                      title="Tarif löschen"
                    >
                      <span className="group-hover/btn:scale-110 transition-transform duration-200 inline-block">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

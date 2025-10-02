import React, { useMemo } from 'reacexport const TarifVergleichChart: React.FC<TarifVergleichChartProps> = ({ 
  tarife, 
  maxVerbrauch = 8000,
  beispielVerbrauch = 3500
}) => {
import type { Stromtarif } from '../types';
import { berechneTarifkosten } from '../types';

interface TarifVergleichChartProps {
  tarife: Stromtarif[];
  maxVerbrauch?: number;
  beispielVerbrauch?: number;
}

const FARBEN = [
  '#3B82F6', // Blau
  '#EF4444', // Rot
  '#10B981', // Grün
  '#F59E0B', // Gelb
  '#8B5CF6', // Violett
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Grau
];

const GRADIENT_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-red-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-purple-500 to-violet-500',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-lime-500 to-green-500',
  'from-pink-500 to-rose-500',
  'from-gray-500 to-slate-500',
];

export const TarifVergleichChart: React.FC<TarifVergleichChartProps> = ({
  tarife,
  maxVerbrauch = 8000
}) => {
  const chartData = useMemo(() => {
    if (tarife.length === 0) return null;

    // Erstelle Verbrauchspunkte für die X-Achse (in 500 kWh Schritten)
    const verbrauchspunkte: number[] = [];
    for (let i = 0; i <= maxVerbrauch; i += 500) {
      verbrauchspunkte.push(i);
    }

    return {
      verbrauchspunkte,
      tarifdaten: tarife.map((tarif, index) => ({
        tarif,
        farbe: FARBEN[index % FARBEN.length],
        gradient: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
        kosten: verbrauchspunkte.map(verbrauch => berechneTarifkosten(tarif, verbrauch))
      }))
    };
  }, [tarife, maxVerbrauch]);

  if (tarife.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-slate-700/50 animate-fadeInUp backdrop-blur-xl">
        <div className="text-6xl mb-6 animate-pulse">�</div>
        <h3 className="text-2xl font-semibold text-slate-300 mb-4">
          Keine Tarife zum Vergleichen
        </h3>
        <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
          Fügen Sie mindestens einen Stromtarif hinzu, um eine intelligente grafische Darstellung zu sehen.
        </p>
      </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-pulse-glow">📈</span>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Interaktiver Tarif-Vergleich
          </h3>
        </div>
        <p className="text-slate-400">
          Jahreskosten-Analyse für verschiedene Verbrauchsszenarien bis {maxVerbrauch.toLocaleString()} kWh
        </p>
      </div>

      {/* Tabellen-basierte Darstellung mit Dark Mode */}
      <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-6 font-medium text-slate-300 bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    Verbrauch (kWh)
                  </div>
                </th>
                {chartData.tarifdaten.map((data) => (
                  <th 
                    key={data.tarif.id}
                    className="text-right py-4 px-6 font-medium bg-slate-800/50"
                    style={{ color: data.farbe }}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: data.farbe }}
                      />
                      {data.tarif.anbieter}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.verbrauchspunkte.map((verbrauch, vIndex) => (
                <tr 
                  key={verbrauch} 
                  className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-300 animate-slideInRight"
                  style={{ animationDelay: `${vIndex * 50}ms` }}
                >
                  <td className="py-3 px-6 font-medium text-slate-200">
                    {verbrauch.toLocaleString()}
                  </td>
                  {chartData.tarifdaten.map((data) => {
                    const kosten = data.kosten[vIndex];
                    const minKostenBeiVerbrauch = Math.min(
                      ...chartData.tarifdaten.map(d => d.kosten[vIndex])
                    );
                    const istGuenstigster = kosten === minKostenBeiVerbrauch;
                    
                    return (
                      <td 
                        key={data.tarif.id}
                        className={`py-3 px-6 text-right font-medium transition-all duration-300 ${
                          istGuenstigster 
                            ? 'bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20' 
                            : 'text-slate-300 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {istGuenstigster && <span className="text-xs">👑</span>}
                          {kosten.toFixed(2)} €
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modernisierte Tarif-Legende */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.tarifdaten.map((data, index) => (
          <div 
            key={data.tarif.id} 
            className="glass rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 animate-slideInRight backdrop-blur-xl"
            style={{ 
              animationDelay: `${index * 100}ms`,
              borderLeftColor: data.farbe, 
              borderLeftWidth: '4px' 
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: data.farbe }}
              />
              <h4 className="font-medium text-slate-200">{data.tarif.anbieter}</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3">{data.tarif.name}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Arbeit:</span>
                <span className="text-blue-300">{data.tarif.arbeitspreis.toFixed(4)} €/kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grund:</span>
                <span className="text-green-300">{data.tarif.grundpreis.toFixed(2)} €/Monat</span>
              </div>
              {data.tarif.praemie > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Prämie:</span>
                  <span className="text-purple-300">{data.tarif.praemie.toFixed(2)} €</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modernisierte grafische Darstellung mit CSS */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <h4 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-3">
          <span className="text-2xl">📊</span>
          Kostenvergleich bei verschiedenen Verbräuchen
        </h4>
        
        <div className="space-y-6">
          {[2000, 3500, 5000, 7000].map((verbrauch, vIndex) => {
            const kosten = chartData.tarifdaten.map(data => ({
              ...data,
              kostenBeiVerbrauch: berechneTarifkosten(data.tarif, verbrauch)
            })).sort((a, b) => a.kostenBeiVerbrauch - b.kostenBeiVerbrauch);
            
            const maxKostenBeiVerbrauch = kosten[kosten.length - 1].kostenBeiVerbrauch;
            
            return (
              <div 
                key={verbrauch} 
                className="glass rounded-xl p-5 border border-slate-600/30 animate-slideInRight"
                style={{ animationDelay: `${vIndex * 200}ms` }}
              >
                <h5 className="font-medium text-slate-300 mb-4 flex items-center gap-2">
                  <span className="text-lg">🏠</span>
                  Bei {verbrauch.toLocaleString()} kWh/Jahr:
                </h5>
                <div className="space-y-3">
                  {kosten.map((item, index) => (
                    <div key={item.tarif.id} className="flex items-center gap-4 group">
                      <div className="flex-1 flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full animate-pulse"
                          style={{ backgroundColor: item.farbe }}
                        />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">
                          {item.tarif.anbieter}
                        </span>
                        {index === 0 && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full animate-pulse neon-green">
                            👑 Günstigster
                          </span>
                        )}
                      </div>
                      <div className="text-right min-w-[120px]">
                        <div className={`font-bold ${index === 0 ? 'text-green-300' : 'text-slate-300'}`}>
                          {item.kostenBeiVerbrauch.toFixed(2)} €
                        </div>
                        {index > 0 && (
                          <div className="text-xs text-red-400">
                            +{(item.kostenBeiVerbrauch - kosten[0].kostenBeiVerbrauch).toFixed(2)} €
                          </div>
                        )}
                      </div>
                      <div className="w-40">
                        <div className="relative h-8 bg-slate-800/50 rounded-lg overflow-hidden">
                          <div 
                            className={`h-full rounded-lg transition-all duration-1000 ease-out bg-gradient-to-r ${item.gradient} opacity-80`}
                            style={{ 
                              width: `${(item.kostenBeiVerbrauch / maxKostenBeiVerbrauch) * 100}%`,
                              animationDelay: `${index * 200}ms`
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

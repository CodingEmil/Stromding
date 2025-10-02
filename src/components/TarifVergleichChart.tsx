import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Stromtarif } from '../types';
import { berechneTarifkosten } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TarifVergleichChartProps {
  tarife: Stromtarif[];
  maxVerbrauch?: number;
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

interface SchnittpunktInfo {
  verbrauch: number;
  tarif1: string;
  tarif2: string;
  kosten: number;
}

interface TarifEmpfehlung {
  tarif: Stromtarif;
  vonVerbrauch: number;
  bisVerbrauch: number;
  farbe: string;
}

interface TarifRanking {
  tarif: Stromtarif;
  rang: number;
  kosten: number;
  mehrkosten: number;
}

interface VerbrauchsRanking {
  verbrauch: number;
  rankings: TarifRanking[];
}

interface TarifOptimalitaet {
  tarif: Stromtarif;
  abVerbrauch: number | null; // null = nie optimal
  bisVerbrauch: number | null; // null = bis unendlich optimal
  istOptimal: boolean;
  alternativen: string[]; // Welche Tarife sind besser
}

// Funktion zur Berechnung wann sich welcher Tarif lohnt
const berechneTarifOptimalitaet = (tarife: Stromtarif[], maxVerbrauch: number): TarifOptimalitaet[] => {
  const schrittweite = 10; // Sehr feine Auflösung für genaue Berechnung
  const optimalitatMappings: TarifOptimalitaet[] = [];

  // Erstelle eine Liste aller Verbrauchspunkte mit dem jeweils günstigsten Tarif
  const verbrauchspunkte: { verbrauch: number; guenstigsterTarif: Stromtarif }[] = [];
  
  for (let verbrauch = 0; verbrauch <= maxVerbrauch; verbrauch += schrittweite) {
    let guenstigsterTarif = tarife[0];
    let guenstigsteKosten = berechneTarifkosten(guenstigsterTarif, verbrauch);
    
    tarife.forEach(tarif => {
      const kosten = berechneTarifkosten(tarif, verbrauch);
      if (kosten < guenstigsteKosten || (kosten === guenstigsteKosten && tarif.id < guenstigsterTarif.id)) {
        guenstigsteKosten = kosten;
        guenstigsterTarif = tarif;
      }
    });
    
    verbrauchspunkte.push({ verbrauch, guenstigsterTarif });
  }

  // Für jeden Tarif bestimme die optimalen Bereiche
  tarife.forEach(tarif => {
    const optimaleBereiche: { von: number; bis: number }[] = [];
    let aktuellerBereichStart: number | null = null;

    verbrauchspunkte.forEach((punkt, index) => {
      const istOptimal = punkt.guenstigsterTarif.id === tarif.id;
      
      if (istOptimal && aktuellerBereichStart === null) {
        // Neuer optimaler Bereich beginnt
        aktuellerBereichStart = punkt.verbrauch;
      } else if (!istOptimal && aktuellerBereichStart !== null) {
        // Optimaler Bereich endet
        const bereichEnde = index > 0 ? verbrauchspunkte[index - 1].verbrauch : punkt.verbrauch;
        optimaleBereiche.push({ von: aktuellerBereichStart, bis: bereichEnde });
        aktuellerBereichStart = null;
      }
    });

    // Falls der Bereich bis zum Ende geht
    if (aktuellerBereichStart !== null) {
      optimaleBereiche.push({ von: aktuellerBereichStart, bis: maxVerbrauch });
    }

    // Bestimme den ersten und letzten optimalen Verbrauch
    const ersterOptimalerVerbrauch = optimaleBereiche.length > 0 ? optimaleBereiche[0].von : null;
    const letzterOptimalerVerbrauch = optimaleBereiche.length > 0 ? 
      optimaleBereiche[optimaleBereiche.length - 1].bis : null;
    const istJemalsOptimal = optimaleBereiche.length > 0;

    // Finde alternative Tarife für nicht-optimale Tarife
    const alternativen: string[] = [];
    if (!istJemalsOptimal) {
      // Finde die besten Alternativen bei mittlerem Verbrauch
      const mittlererVerbrauch = maxVerbrauch / 2;
      const kostenAktuell = berechneTarifkosten(tarif, mittlererVerbrauch);
      
      const bessereAlternativen = tarife
        .filter(andereTarif => andereTarif.id !== tarif.id)
        .map(andereTarif => ({
          tarif: andereTarif,
          kosten: berechneTarifkosten(andereTarif, mittlererVerbrauch)
        }))
        .filter(alt => alt.kosten < kostenAktuell)
        .sort((a, b) => a.kosten - b.kosten)
        .slice(0, 3) // Top 3 Alternativen
        .map(alt => alt.tarif.name);
      
      alternativen.push(...bessereAlternativen);
    }

    optimalitatMappings.push({
      tarif,
      abVerbrauch: ersterOptimalerVerbrauch,
      bisVerbrauch: letzterOptimalerVerbrauch === maxVerbrauch ? null : letzterOptimalerVerbrauch,
      istOptimal: istJemalsOptimal,
      alternativen
    });
  });

  return optimalitatMappings;
};

// Funktion zur Berechnung des Tarif-Rankings für verschiedene Verbrauchswerte
const berechneTarifRanking = (tarife: Stromtarif[], testVerbraeuche: number[]): VerbrauchsRanking[] => {
  return testVerbraeuche.map(verbrauch => {
    // Berechne Kosten für alle Tarife bei diesem Verbrauch
    const tarifeMitKosten = tarife.map(tarif => ({
      tarif,
      kosten: berechneTarifkosten(tarif, verbrauch)
    }));

    // Sortiere nach Kosten (günstigster zuerst)
    tarifeMitKosten.sort((a, b) => a.kosten - b.kosten);

    // Erstelle Ranking mit Rang und Mehrkosten
    const guenstigsteKosten = tarifeMitKosten[0].kosten;
    const rankings: TarifRanking[] = tarifeMitKosten.map((item, index) => ({
      tarif: item.tarif,
      rang: index + 1,
      kosten: item.kosten,
      mehrkosten: item.kosten - guenstigsteKosten
    }));

    return {
      verbrauch,
      rankings
    };
  });
};

export const TarifVergleichChart: React.FC<TarifVergleichChartProps> = ({
  tarife,
  maxVerbrauch: initialMaxVerbrauch = 8000
}) => {
  const [maxVerbrauch, setMaxVerbrauch] = useState(initialMaxVerbrauch);
  const [schrittweite, setSchrittweite] = useState(250);
  const [sichtbareTarife, setSichtbareTarife] = useState<Set<string>>(
    new Set(tarife.map(t => t.id))
  );

  // Aktualisiere sichtbare Tarife wenn sich die Tarif-Liste ändert
  React.useEffect(() => {
    setSichtbareTarife(new Set(tarife.map(t => t.id)));
  }, [tarife]);

  // Toggle-Funktionen für Tarif-Sichtbarkeit
  const toggleTarif = (tarifId: string) => {
    setSichtbareTarife(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tarifId)) {
        newSet.delete(tarifId);
      } else {
        newSet.add(tarifId);
      }
      return newSet;
    });
  };

  const toggleAlleTarife = () => {
    if (sichtbareTarife.size === tarife.length) {
      // Alle ausblenden
      setSichtbareTarife(new Set());
    } else {
      // Alle einblenden
      setSichtbareTarife(new Set(tarife.map(t => t.id)));
    }
  };
  // Berechne Schnittpunkte und Empfehlungen
  const { verbrauchspunkte } = useMemo(() => {
    if (tarife.length === 0) return { verbrauchspunkte: [], schnittpunkte: [], empfehlungen: [] };

    // Erstelle Verbrauchspunkte
    const punkte: number[] = [];
    for (let i = 0; i <= maxVerbrauch; i += schrittweite) {
      punkte.push(i);
    }

    // Finde Schnittpunkte zwischen Tarifen
    const schnittpunkte: SchnittpunktInfo[] = [];
    for (let i = 0; i < tarife.length; i++) {
      for (let j = i + 1; j < tarife.length; j++) {
        const tarif1 = tarife[i];
        const tarif2 = tarife[j];
        
        // Berechne Schnittpunkt (wo beide Tarife gleich teuer sind)
        // tarif1: (arbeitspreis1 * v + grundpreis1 * 12 - praemie1) = tarif2: (arbeitspreis2 * v + grundpreis2 * 12 - praemie2)
        // v = ((grundpreis2 - grundpreis1) * 12 + praemie1 - praemie2) / (arbeitspreis1 - arbeitspreis2)
        
        const arbeitsdiff = tarif1.arbeitspreis - tarif2.arbeitspreis;
        if (Math.abs(arbeitsdiff) > 0.00001) { // Vermeide Division durch Null
          const grunddiff = (tarif2.grundpreis - tarif1.grundpreis) * 12;
          const praemiendiff = tarif1.praemie - tarif2.praemie;
          const schnittpunkt = (grunddiff + praemiendiff) / arbeitsdiff;
          
          if (schnittpunkt > 0 && schnittpunkt <= maxVerbrauch) {
            schnittpunkte.push({
              verbrauch: Math.round(schnittpunkt),
              tarif1: tarif1.name,
              tarif2: tarif2.name,
              kosten: berechneTarifkosten(tarif1, schnittpunkt)
            });
          }
        }
      }
    }

    // Sortiere Schnittpunkte nach Verbrauch
    schnittpunkte.sort((a, b) => a.verbrauch - b.verbrauch);

    // Erstelle Empfehlungen für verschiedene Verbrauchsbereiche
    const empfehlungen: TarifEmpfehlung[] = [];
    const bereiche = [0, 1500, 3000, 4500, 6000, maxVerbrauch];
    
    for (let i = 0; i < bereiche.length - 1; i++) {
      const vonVerbrauch = bereiche[i];
      const bisVerbrauch = bereiche[i + 1];
      const mittlererVerbrauch = (vonVerbrauch + bisVerbrauch) / 2;
      
      // Finde günstigsten Tarif für diesen Bereich
      let guenstigsterTarif = tarife[0];
      let guenstigsteKosten = berechneTarifkosten(guenstigsterTarif, mittlererVerbrauch);
      
      tarife.forEach(tarif => {
        const kosten = berechneTarifkosten(tarif, mittlererVerbrauch);
        if (kosten < guenstigsteKosten) {
          guenstigsteKosten = kosten;
          guenstigsterTarif = tarif;
        }
      });
      
      const tarifIndex = tarife.indexOf(guenstigsterTarif);
      empfehlungen.push({
        tarif: guenstigsterTarif,
        vonVerbrauch,
        bisVerbrauch,
        farbe: FARBEN[tarifIndex % FARBEN.length]
      });
    }

    return { verbrauchspunkte: punkte, schnittpunkte, empfehlungen };
  }, [tarife, maxVerbrauch, schrittweite]);

  // Wenn keine Tarife vorhanden sind, zeige eine Nachricht
  if (tarife.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-slate-700/50 animate-fadeInUp backdrop-blur-xl">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-2xl font-semibold text-slate-200 mb-2">Keine Tarife zum Vergleichen</h3>
        <p className="text-slate-400 text-lg">
          Fügen Sie Stromtarife hinzu, um einen detaillierten Vergleich zu sehen.
        </p>
      </div>
    );
  }

  // Erstelle Datasets nur für sichtbare Tarife
  const datasets = tarife
    .filter(tarif => sichtbareTarife.has(tarif.id))
    .map((tarif) => {
      const originalIndex = tarife.indexOf(tarif);
      return {
        label: tarif.name,
        data: verbrauchspunkte.map(verbrauch => berechneTarifkosten(tarif, verbrauch)),
        borderColor: FARBEN[originalIndex % FARBEN.length],
        backgroundColor: FARBEN[originalIndex % FARBEN.length] + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: FARBEN[originalIndex % FARBEN.length],
        pointHoverBorderColor: '#1e293b',
        pointHoverBorderWidth: 2,
      };
    });

  const chartData = {
    labels: verbrauchspunkte.map(v => `${v}`),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 20,
          padding: 15,
          color: '#e2e8f0', // Slate-200
          font: {
            size: 13,
            weight: 500 as const,
          },
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      title: {
        display: true,
        text: 'Stromtarif-Vergleich: Jahreskosten nach Verbrauch',
        color: '#f1f5f9', // Slate-100
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        padding: 25,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slate-900 with opacity
        titleColor: '#f1f5f9', // Slate-100
        bodyColor: '#cbd5e1', // Slate-300
        borderColor: '#475569', // Slate-600
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const tarifInfo = tarife[context.datasetIndex];
            const kosten = context.parsed.y;
            
            return [
              `${context.dataset.label}: ${kosten.toFixed(2)} €/Jahr`,
              `Arbeitspreis: ${tarifInfo.arbeitspreis.toFixed(4)} €/kWh`,
              `Grundpreis: ${tarifInfo.grundpreis.toFixed(2)} €/Monat`,
              ...(tarifInfo.praemie > 0 ? [`Prämie: ${tarifInfo.praemie.toFixed(2)} €`] : []),
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Jahresverbrauch (kWh)',
          color: '#cbd5e1', // Slate-300
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(71, 85, 105, 0.3)', // Slate-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8', // Slate-400
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Jahreskosten (€)',
          color: '#cbd5e1', // Slate-300
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(71, 85, 105, 0.3)', // Slate-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8', // Slate-400
          font: {
            size: 12,
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Skalierung Controls */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚙️</span>
          <h3 className="text-xl font-semibold text-slate-100">Diagramm-Einstellungen</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximaler Verbrauch (kWh/Jahr)
            </label>
            <input
              type="number"
              value={maxVerbrauch}
              onChange={(e) => setMaxVerbrauch(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              min="1000"
              max="20000"
              step="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Schrittweite (kWh)
            </label>
            <select
              value={schrittweite}
              onChange={(e) => setSchrittweite(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            >
              <option value={100}>100 kWh</option>
              <option value={250}>250 kWh</option>
              <option value={500}>500 kWh</option>
              <option value={1000}>1000 kWh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tarif-Auswahl */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👁️</span>
            <h3 className="text-xl font-semibold text-slate-100">Tarife im Diagramm</h3>
          </div>
          <button
            onClick={toggleAlleTarife}
            className="px-4 py-2 glass border border-slate-600 rounded-lg text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-all duration-300 text-sm font-medium"
          >
            {sichtbareTarife.size === tarife.length ? '🙈 Alle ausblenden' : '👁️ Alle anzeigen'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tarife.map((tarif, index) => {
            const isVisible = sichtbareTarife.has(tarif.id);
            const farbe = FARBEN[index % FARBEN.length];
            
            return (
              <label
                key={tarif.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer
                  ${isVisible 
                    ? 'border-slate-500/50 bg-slate-700/30 hover:bg-slate-700/50' 
                    : 'border-slate-600/30 bg-slate-800/20 hover:bg-slate-700/30'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleTarif(tarif.id)}
                  className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500/20 focus:ring-2"
                />
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: farbe }}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium text-sm transition-colors ${isVisible ? 'text-slate-100' : 'text-slate-400'}`}>
                      {tarif.name}
                    </div>
                  </div>
                </div>
                <div className={`text-xs transition-colors ${isVisible ? 'text-slate-300' : 'text-slate-500'}`}>
                  {isVisible ? '✅' : '⭕'}
                </div>
              </label>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          <span>💡</span>
          <span>
            Klicken Sie auf die Tarife um sie im Diagramm ein- oder auszublenden. 
            Sichtbare Tarife: {sichtbareTarife.size} von {tarife.length}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div style={{ height: '500px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Tarif-Optimalität Übersicht */}
      {tarife.length > 1 && (
        <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-semibold text-slate-100">Wann lohnt sich welcher Tarif?</h3>
          </div>
          
          {(() => {
            const optimalitatDaten = berechneTarifOptimalitaet(tarife, maxVerbrauch);
            
            return (
              <div className="space-y-4">
                {optimalitatDaten.map((daten, index) => (
                  <div 
                    key={daten.tarif.id}
                    className={`
                      p-4 rounded-xl border transition-all duration-300
                      ${daten.istOptimal 
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20' 
                        : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 hover:bg-red-500/20'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: FARBEN[index % FARBEN.length] }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-slate-100 text-lg">
                            {daten.tarif.name}
                          </h4>
                          {daten.istOptimal ? (
                            <div className="mt-1">
                              <span className="text-green-300 font-medium">
                                ✅ Lohnt sich von{' '}
                                {daten.abVerbrauch?.toLocaleString() || '0'} kWh
                                {daten.bisVerbrauch 
                                  ? ` bis ${daten.bisVerbrauch.toLocaleString()} kWh` 
                                  : ' bis unendlich'
                                }
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-red-300 font-medium">
                                ❌ Lohnt sich nie bei diesem Verbrauchsbereich
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {daten.istOptimal ? (
                          <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                            🏆 Optimal
                          </div>
                        ) : (
                          <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                            ⚠️ Nicht optimal
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!daten.istOptimal && daten.alternativen.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600/30">
                        <p className="text-slate-400 text-sm mb-2">
                          🔄 Bessere Alternativen:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daten.alternativen.map((alternative, altIndex) => (
                            <span 
                              key={altIndex}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm"
                            >
                              {alternative}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-slate-600/30">
                      <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                        <div>
                          <span className="text-blue-400">⚡</span> {daten.tarif.arbeitspreis.toFixed(4)} €/kWh
                        </div>
                        <div>
                          <span className="text-green-400">💰</span> {daten.tarif.grundpreis.toFixed(2)} €/Monat
                        </div>
                        {daten.tarif.praemie > 0 && (
                          <div>
                            <span className="text-purple-400">🎁</span> {daten.tarif.praemie.toFixed(2)} € Prämie
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <span>💡</span>
            <span>
              Diese Übersicht zeigt den optimalen Verbrauchsbereich für jeden Tarif. 
              Tarife die sich nie lohnen bekommen bessere Alternativen vorgeschlagen.
            </span>
          </div>
        </div>
      )}

      {/* Tarif-Ranking für verschiedene Verbrauchswerte */}
      {tarife.length > 1 && (
        <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">�</span>
            <h3 className="text-xl font-semibold text-slate-100">Tarif-Ranking nach Verbrauch</h3>
          </div>
          
          {(() => {
            // Berechne Rankings basierend auf dem maxVerbrauch aus dem Chart
            const schritte = 5; // Anzahl der Verbrauchsstufen
            const testVerbraeuche: number[] = [];
            
            // Erstelle gleichmäßig verteilte Verbrauchswerte basierend auf maxVerbrauch
            for (let i = 1; i <= schritte; i++) {
              const verbrauch = Math.round((maxVerbrauch / schritte) * i);
              testVerbraeuche.push(verbrauch);
            }
            
            const rankings = berechneTarifRanking(tarife, testVerbraeuche);
            
            return (
              <div className="space-y-6">
                {rankings.map((verbrauchsRanking, index) => (
                  <div key={index} className="border border-slate-600/30 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <span className="text-blue-400">📊</span>
                      Bei {verbrauchsRanking.verbrauch.toLocaleString()} kWh/Jahr
                    </h4>
                    
                    <div className="space-y-2">
                      {verbrauchsRanking.rankings.map((ranking, rankIndex) => (
                        <div 
                          key={ranking.tarif.id}
                          className={`
                            flex items-center justify-between p-3 rounded-lg transition-all duration-300
                            ${ranking.rang === 1 
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
                              : ranking.rang === 2
                              ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20'
                              : ranking.rang === 3
                              ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20'
                              : 'bg-slate-700/30 border border-slate-600/20'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                              ${ranking.rang === 1 ? 'bg-green-500 text-white' :
                                ranking.rang === 2 ? 'bg-blue-500 text-white' :
                                ranking.rang === 3 ? 'bg-orange-500 text-white' :
                                'bg-slate-600 text-slate-300'
                              }
                            `}>
                              {ranking.rang === 1 ? '🥇' : 
                               ranking.rang === 2 ? '🥈' :
                               ranking.rang === 3 ? '🥉' :
                               ranking.rang}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: FARBEN[rankIndex % FARBEN.length] }}
                              ></div>
                              <span className={`font-medium ${
                                ranking.rang === 1 ? 'text-green-200' :
                                ranking.rang <= 3 ? 'text-slate-100' : 'text-slate-300'
                              }`}>
                                {ranking.tarif.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-semibold ${
                              ranking.rang === 1 ? 'text-green-200' : 'text-slate-200'
                            }`}>
                              {ranking.kosten.toFixed(2)} €/Jahr
                            </div>
                            {ranking.mehrkosten > 0 && (
                              <div className="text-red-400 text-sm">
                                +{ranking.mehrkosten.toFixed(2)} € teurer
                              </div>
                            )}
                            {ranking.rang === 1 && (
                              <div className="text-green-400 text-sm font-medium">
                                Günstigster! 🎯
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <span>💡</span>
            <span>
              Das Ranking zeigt alle Tarife sortiert nach Kosten für verschiedene Jahresverbräuche. 
              🥇 = Günstigster, 🥈 = Zweitbester, 🥉 = Drittbester
            </span>
          </div>
        </div>
      )}

      {/* Tarif-Übersicht */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📋</span>
          <h3 className="text-xl font-semibold text-slate-100">Tarif-Übersicht</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tarife.map((tarif, index) => (
            <div
              key={tarif.id}
              className="glass rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:scale-105"
              style={{ borderLeftColor: FARBEN[index % FARBEN.length], borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: FARBEN[index % FARBEN.length] }}
                ></div>
                <h4 className="font-semibold text-slate-100">{tarif.name}</h4>
              </div>
              <p className="text-slate-300 mb-3 text-sm">{tarif.name}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center glass rounded-lg p-2 border border-slate-600/20">
                  <span className="text-slate-400">⚡ Arbeitspreis:</span>
                  <span className="text-blue-300 font-medium">{tarif.arbeitspreis.toFixed(4)} €/kWh</span>
                </div>
                <div className="flex justify-between items-center glass rounded-lg p-2 border border-slate-600/20">
                  <span className="text-slate-400">💰 Grundpreis:</span>
                  <span className="text-green-300 font-medium">{tarif.grundpreis.toFixed(2)} €/Monat</span>
                </div>
                {tarif.praemie > 0 && (
                  <div className="flex justify-between items-center glass rounded-lg p-2 border border-slate-600/20">
                    <span className="text-slate-400">🎁 Prämie:</span>
                    <span className="text-yellow-300 font-medium">{tarif.praemie.toFixed(2)} €</span>
                  </div>
                )}
                {tarif.vertragslaufzeit && (
                  <div className="flex justify-between items-center glass rounded-lg p-2 border border-slate-600/20">
                    <span className="text-slate-400">📅 Laufzeit:</span>
                    <span className="text-purple-300 font-medium">{tarif.vertragslaufzeit} Monate</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

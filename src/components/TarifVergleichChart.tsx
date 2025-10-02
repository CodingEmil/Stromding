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

interface OptimalerBereich {
  tarifName: string;
  bereich: string;
  beschreibung: string;
}

// Funktion zur Berechnung der optimalen Verbrauchsbereiche
const berechneOptimaleBereiche = (tarife: Stromtarif[], schnittpunkte: SchnittpunktInfo[], maxVerbrauch: number): OptimalerBereich[] => {
  if (tarife.length === 0) return [];
  
  const bereiche: OptimalerBereich[] = [];
  
  // Erstelle Verbrauchspunkte basierend auf Schnittpunkten
  const verbrauchspunkte = [0];
  schnittpunkte.forEach(s => verbrauchspunkte.push(s.verbrauch));
  verbrauchspunkte.push(maxVerbrauch);
  verbrauchspunkte.sort((a, b) => a - b);
  
  // Entferne Duplikate
  const einzigartigeVerbrauchspunkte = [...new Set(verbrauchspunkte)];
  
  let aktuellerTarif = '';
  let bereichStart = 0;
  
  for (let i = 0; i < einzigartigeVerbrauchspunkte.length - 1; i++) {
    const vonVerbrauch = einzigartigeVerbrauchspunkte[i];
    const bisVerbrauch = einzigartigeVerbrauchspunkte[i + 1];
    const testVerbrauch = vonVerbrauch + 100; // Teste etwas über dem Startpunkt
    
    // Finde günstigsten Tarif für diesen Punkt
    let guenstigsterTarif = tarife[0];
    let guenstigsteKosten = berechneTarifkosten(guenstigsterTarif, testVerbrauch);
    
    tarife.forEach(tarif => {
      const kosten = berechneTarifkosten(tarif, testVerbrauch);
      if (kosten < guenstigsteKosten) {
        guenstigsteKosten = kosten;
        guenstigsterTarif = tarif;
      }
    });
    
    const neuerTarifName = guenstigsterTarif.name;
    
    // Wenn sich der Tarif ändert, schließe den vorherigen Bereich ab
    if (aktuellerTarif !== '' && aktuellerTarif !== neuerTarifName) {
      bereiche.push({
        tarifName: aktuellerTarif,
        bereich: formatierBereich(bereichStart, vonVerbrauch, maxVerbrauch),
        beschreibung: getBeschreibung(bereichStart, vonVerbrauch)
      });
      bereichStart = vonVerbrauch;
    } else if (aktuellerTarif === '') {
      bereichStart = vonVerbrauch;
    }
    
    aktuellerTarif = neuerTarifName;
    
    // Letzter Bereich
    if (i === einzigartigeVerbrauchspunkte.length - 2) {
      bereiche.push({
        tarifName: aktuellerTarif,
        bereich: formatierBereich(bereichStart, bisVerbrauch, maxVerbrauch),
        beschreibung: getBeschreibung(bereichStart, bisVerbrauch)
      });
    }
  }
  
  return bereiche;
};

// Hilfsfunktionen
const formatierBereich = (von: number, bis: number, maxVerbrauch: number): string => {
  if (von === 0) {
    return `bis ${bis.toLocaleString()} kWh/Jahr`;
  } else if (bis >= maxVerbrauch) {
    return `ab ${von.toLocaleString()} kWh/Jahr`;
  } else {
    return `${von.toLocaleString()} - ${bis.toLocaleString()} kWh/Jahr`;
  }
};

const getBeschreibung = (von: number, bis: number): string => {
  const mittlererVerbrauch = (von + bis) / 2;
  if (mittlererVerbrauch < 2000) return "Niedrigverbraucher";
  if (mittlererVerbrauch < 4500) return "Normalverbraucher";
  return "Hochverbraucher";
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
  const { verbrauchspunkte, schnittpunkte, empfehlungen } = useMemo(() => {
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
    .map((tarif, index) => {
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

      {/* Tarifempfehlungen */}
      {empfehlungen.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-semibold text-slate-100">Tarifempfehlungen nach Verbrauch</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empfehlungen.map((empfehlung, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                style={{ borderLeftColor: empfehlung.farbe, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: empfehlung.farbe }}
                  ></div>
                  <span className="text-slate-300 text-sm font-medium">
                    {empfehlung.vonVerbrauch.toLocaleString()} - {empfehlung.bisVerbrauch.toLocaleString()} kWh/Jahr
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-lg mb-1">
                  {empfehlung.tarif.name}
                </h4>
                <p className="text-slate-300 text-sm mb-3">{empfehlung.tarif.name}</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>⚡ {empfehlung.tarif.arbeitspreis.toFixed(4)} €/kWh</div>
                  <div>💰 {empfehlung.tarif.grundpreis.toFixed(2)} €/Monat</div>
                  {empfehlung.tarif.praemie > 0 && (
                    <div>🎁 {empfehlung.tarif.praemie.toFixed(2)} € Prämie</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimaler Verbrauchsbereich pro Tarif */}
      {schnittpunkte.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-semibold text-slate-100">Wann lohnt sich welcher Tarif?</h3>
          </div>
          <div className="space-y-3">
            {berechneOptimaleBereiche(tarife, schnittpunkte, maxVerbrauch).map((bereich, index) => (
              <div 
                key={index}
                className="glass rounded-lg p-4 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: FARBEN[index % FARBEN.length] }}
                    ></div>
                    <span className="text-slate-100 font-medium text-lg">
                      {bereich.tarifName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-200 font-semibold">
                      {bereich.bereich}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {bereich.beschreibung}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

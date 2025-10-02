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

export const TarifVergleichChart: React.FC<TarifVergleichChartProps> = ({
  tarife,
  maxVerbrauch: initialMaxVerbrauch = 8000
}) => {
  const [maxVerbrauch, setMaxVerbrauch] = useState(initialMaxVerbrauch);
  const [schrittweite, setSchrittweite] = useState(250);
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
              tarif1: `${tarif1.anbieter} - ${tarif1.name}`,
              tarif2: `${tarif2.anbieter} - ${tarif2.name}`,
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
        <div className="text-6xl mb-4 animate-pulse-glow">📈</div>
        <h3 className="text-2xl font-semibold text-slate-200 mb-2">Keine Tarife zum Vergleichen</h3>
        <p className="text-slate-400 text-lg">
          Fügen Sie Stromtarife hinzu, um einen detaillierten Vergleich zu sehen.
        </p>
      </div>
    );
  }

  // Erstelle Datasets für jeden Tarif
  const datasets = tarife.map((tarif, index) => ({
    label: `${tarif.anbieter} - ${tarif.name}`,
    data: verbrauchspunkte.map(verbrauch => berechneTarifkosten(tarif, verbrauch)),
    borderColor: FARBEN[index % FARBEN.length],
    backgroundColor: FARBEN[index % FARBEN.length] + '20',
    borderWidth: 3,
    fill: false,
    tension: 0.1,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: FARBEN[index % FARBEN.length],
    pointHoverBorderColor: '#1e293b',
    pointHoverBorderWidth: 2,
  }));

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
          <span className="text-2xl animate-pulse-glow">⚙️</span>
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
            <span className="text-2xl animate-pulse-glow">🎯</span>
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
                  {empfehlung.tarif.anbieter}
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

      {/* Schnittpunkte */}
      {schnittpunkte.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl animate-pulse-glow">📊</span>
            <h3 className="text-xl font-semibold text-slate-100">Tarifwechsel-Punkte</h3>
            <span className="text-sm text-slate-400">
              (Verbrauchspunkte, bei denen sich die Kostenverhältnisse ändern)
            </span>
          </div>
          <div className="space-y-3">
            {schnittpunkte.map((punkt, index) => (
              <div 
                key={index}
                className="glass rounded-lg p-4 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-200 font-medium">
                      Bei {punkt.verbrauch.toLocaleString()} kWh/Jahr
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm">
                    Kosten: {punkt.kosten.toFixed(2)} €/Jahr
                  </div>
                </div>
                <div className="mt-2 text-slate-400 text-sm">
                  <span className="text-cyan-400">Ab diesem Verbrauch</span> wechselt das Kostenverhältnis zwischen:
                </div>
                <div className="mt-1 text-slate-300 text-sm font-medium">
                  • {punkt.tarif1} ↔ {punkt.tarif2}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarif-Übersicht */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl animate-pulse-glow">📋</span>
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
                <h4 className="font-semibold text-slate-100">{tarif.anbieter}</h4>
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

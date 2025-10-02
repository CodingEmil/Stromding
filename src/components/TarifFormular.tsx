import { useState, useEffect } from 'react';
import type { Stromtarif } from '../types';

interface TarifFormularProps {
  onTarifHinzufuegen: (tarif: Omit<Stromtarif, 'id'>) => void;
  onTarifAktualisieren?: (id: string, tarif: Partial<Stromtarif>) => void;
  bearbeitungsTarif?: Stromtarif | null;
  onBearbeitungAbbrechen?: () => void;
}

export const TarifFormular = ({ 
  onTarifHinzufuegen, 
  onTarifAktualisieren,
  bearbeitungsTarif,
  onBearbeitungAbbrechen
}: TarifFormularProps) => {
  const [formData, setFormData] = useState({
    name: '',
    arbeitspreis: '',
    grundpreis: '',
    praemie: '',
    vertragslaufzeit: '',
    preisgarantie: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const istBearbeitungsModus = !!bearbeitungsTarif;

  // Formular mit Bearbeitungsdaten füllen
  useEffect(() => {
    if (bearbeitungsTarif) {
      setFormData({
        name: bearbeitungsTarif.name,
        arbeitspreis: bearbeitungsTarif.arbeitspreis.toString(),
        grundpreis: bearbeitungsTarif.grundpreis.toString(),
        praemie: bearbeitungsTarif.praemie.toString(),
        vertragslaufzeit: bearbeitungsTarif.vertragslaufzeit?.toString() || '',
        preisgarantie: bearbeitungsTarif.preisgarantie?.toString() || ''
      });
    } else {
      // Formular zurücksetzen
      setFormData({
        name: '',
        arbeitspreis: '',
        grundpreis: '',
        praemie: '',
        vertragslaufzeit: '',
        preisgarantie: ''
      });
    }
  }, [bearbeitungsTarif]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tarifDaten = {
      name: formData.name,
      anbieter: 'Anbieter', // Standard-Anbieter, da nur der Name relevant ist
      arbeitspreis: parseFloat(formData.arbeitspreis),
      grundpreis: parseFloat(formData.grundpreis),
      praemie: parseFloat(formData.praemie) || 0,
      vertragslaufzeit: formData.vertragslaufzeit ? parseInt(formData.vertragslaufzeit) : undefined,
      preisgarantie: formData.preisgarantie ? parseInt(formData.preisgarantie) : undefined
    };

    if (istBearbeitungsModus && bearbeitungsTarif && onTarifAktualisieren) {
      // Tarif aktualisieren
      onTarifAktualisieren(bearbeitungsTarif.id, tarifDaten);
      onBearbeitungAbbrechen?.();
    } else {
      // Neuen Tarif hinzufügen
      onTarifHinzufuegen(tarifDaten);
    }
    
    // Formular zurücksetzen nur wenn nicht im Bearbeitungsmodus
    if (!istBearbeitungsModus) {
      setFormData({
        name: '',
        arbeitspreis: '',
        grundpreis: '',
        praemie: '',
        vertragslaufzeit: '',
        preisgarantie: ''
      });
    }
    
    setIsSubmitting(false);
  };

  const handleAbbrechen = () => {
    onBearbeitungAbbrechen?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="glass rounded-2xl p-8 border border-slate-700/50 animate-fadeInUp backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <span className="text-4xl">⚡</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {istBearbeitungsModus ? 'Tarif bearbeiten' : 'Neuen Stromtarif hinzufügen'}
          </h2>
          <p className="text-slate-400 mt-1">
            {istBearbeitungsModus 
              ? 'Aktualisieren Sie die Tarifdetails für eine optimierte Analyse'
              : 'Geben Sie die Tarifdetails für einen präzisen Vergleich ein'
            }
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors">
            📝 Tarifname *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
            placeholder="z.B. Ökostrom Plus"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-cyan-400 transition-colors">
            ⚡ Arbeitspreis (€/kWh) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="arbeitspreis"
              value={formData.arbeitspreis}
              onChange={handleChange}
              required
              step="0.0001"
              min="0"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
              placeholder="0.2800"
            />
            <div className="absolute right-3 top-3 text-slate-400 text-sm">€/kWh</div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-green-400 transition-colors">
            💰 Grundpreis (€/Monat) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="grundpreis"
              value={formData.grundpreis}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
              placeholder="12.90"
            />
            <div className="absolute right-3 top-3 text-slate-400 text-sm">€/Monat</div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-yellow-400 transition-colors">
            🎁 Prämie/Bonus (€)
          </label>
          <div className="relative">
            <input
              type="number"
              name="praemie"
              value={formData.praemie}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
              placeholder="100.00"
            />
            <div className="absolute right-3 top-3 text-slate-400 text-sm">€ einmalig</div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-indigo-400 transition-colors">
            📅 Vertragslaufzeit (Monate)
          </label>
          <input
            type="number"
            name="vertragslaufzeit"
            value={formData.vertragslaufzeit}
            onChange={handleChange}
            min="1"
            max="36"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
            placeholder="12"
          />
        </div>

        <div className="md:col-span-2 mt-4">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-500 transform ${
                isSubmitting 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 scale-95 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
              } text-white overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{istBearbeitungsModus ? 'Tarif wird aktualisiert...' : 'Tarif wird hinzugefügt...'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {istBearbeitungsModus ? '✏️' : '⚡'}
                    </span>
                    <span>{istBearbeitungsModus ? 'Tarif aktualisieren' : 'Tarif hinzufügen'}</span>
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {istBearbeitungsModus ? '💾' : '🚀'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>
            </button>

            {istBearbeitungsModus && (
              <button
                type="button"
                onClick={handleAbbrechen}
                className="group glass px-6 py-4 rounded-xl text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg"
              >
                <span className="group-hover:scale-110 transition-transform duration-200 inline-block">❌</span>
                <span className="ml-2">Abbrechen</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

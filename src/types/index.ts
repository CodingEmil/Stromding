// Typen für die Stromtarif-Anwendung

export interface Stromtarif {
  id: string;
  name: string;
  anbieter: string;
  arbeitspreis: number; // €/kWh
  grundpreis: number; // €/Monat
  praemie: number; // € einmalig
  vertragslaufzeit?: number; // Monate
  preisgarantie?: number; // Monate
}

// Utility-Funktionen für Berechnungen
export const berechneTarifkosten = (
  tarif: Stromtarif, 
  jahresverbrauch: number
): number => {
  const arbeitskosten = jahresverbrauch * tarif.arbeitspreis;
  const grundkosten = tarif.grundpreis * 12;
  const gesamtkosten = arbeitskosten + grundkosten - tarif.praemie;
  return Math.max(0, gesamtkosten); // Negative Kosten vermeiden
};

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

export interface TarifBerechnung {
  tarif: Stromtarif;
  jahreskosten: number;
  ersparnis?: number;
}

export interface VerbrauchsDaten {
  jahresverbrauch: number; // kWh
  berechnungen: TarifBerechnung[];
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

export const findeGuenstigstenTarif = (
  tarife: Stromtarif[], 
  jahresverbrauch: number
): TarifBerechnung | null => {
  if (tarife.length === 0) return null;
  
  const berechnungen = tarife.map(tarif => ({
    tarif,
    jahreskosten: berechneTarifkosten(tarif, jahresverbrauch)
  }));
  
  return berechnungen.reduce((guenstigster, aktuell) => 
    aktuell.jahreskosten < guenstigster.jahreskosten ? aktuell : guenstigster
  );
};

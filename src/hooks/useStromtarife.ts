import { useState, useEffect } from 'react';
import type { Stromtarif } from '../types';

const STORAGE_KEY = 'stromtarife';

export const useStromtarife = () => {
  const [tarife, setTarife] = useState<Stromtarif[]>([]);

  // Tarife aus localStorage laden
  useEffect(() => {
    const gespeicherteTarife = localStorage.getItem(STORAGE_KEY);
    if (gespeicherteTarife) {
      try {
        setTarife(JSON.parse(gespeicherteTarife));
      } catch (error) {
        console.error('Fehler beim Laden der Tarife:', error);
      }
    }
  }, []);

  // Tarife in localStorage speichern
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarife));
  }, [tarife]);

  const tarifHinzufuegen = (neuerTarif: Omit<Stromtarif, 'id'>) => {
    const tarif: Stromtarif = {
      ...neuerTarif,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setTarife(prev => [...prev, tarif]);
  };

  const tarifAktualisieren = (id: string, aktualisierterTarif: Partial<Stromtarif>) => {
    setTarife(prev => prev.map(tarif => 
      tarif.id === id ? { ...tarif, ...aktualisierterTarif } : tarif
    ));
  };

  const tarifLoeschen = (id: string) => {
    setTarife(prev => prev.filter(tarif => tarif.id !== id));
  };

  const alleTarifeLoeschen = () => {
    setTarife([]);
  };

  return {
    tarife,
    tarifHinzufuegen,
    tarifAktualisieren,
    tarifLoeschen,
    alleTarifeLoeschen
  };
};

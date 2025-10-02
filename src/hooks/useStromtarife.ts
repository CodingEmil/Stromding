import { useState, useEffect, useCallback } from 'react';
import type { Stromtarif } from '../types';
import { authService } from '../services/authService';

export const useStromtarife = (userId?: string) => {
  const [tarife, setTarife] = useState<Stromtarif[]>([]);

  // Lade Tarife für den aktuellen Benutzer
  const loadTarife = useCallback(() => {
    if (!userId) {
      setTarife([]);
      return;
    }

    const userData = authService.getUserData(userId);
    setTarife(userData.tarife);
  }, [userId]);

  // Speichere Tarife für den aktuellen Benutzer
  const saveTarife = useCallback((newTarife: Stromtarif[]) => {
    if (!userId) return;

    const userData = authService.getUserData(userId);
    const updatedData = {
      ...userData,
      tarife: newTarife
    };
    authService.saveUserData(userId, updatedData);
    setTarife(newTarife);
  }, [userId]);

  // Lade Tarife beim Start oder wenn sich der Benutzer ändert
  useEffect(() => {
    loadTarife();
  }, [loadTarife]);

  // Tarif hinzufügen
  const tarifHinzufuegen = useCallback((neuerTarif: Omit<Stromtarif, 'id'>) => {
    const tarif: Stromtarif = {
      ...neuerTarif,
      id: crypto.randomUUID(),
    };
    
    const neueTarife = [...tarife, tarif];
    saveTarife(neueTarife);
  }, [tarife, saveTarife]);

  // Tarif aktualisieren
  const tarifAktualisieren = useCallback((id: string, aktualisierterTarif: Partial<Stromtarif>) => {
    const neueTarife = tarife.map(tarif => 
      tarif.id === id ? { ...tarif, ...aktualisierterTarif } : tarif
    );
    saveTarife(neueTarife);
  }, [tarife, saveTarife]);

  // Tarif löschen
  const tarifLoeschen = useCallback((id: string) => {
    const neueTarife = tarife.filter(tarif => tarif.id !== id);
    saveTarife(neueTarife);
  }, [tarife, saveTarife]);

  // Alle Tarife löschen
  const alleTarifeLoeschen = useCallback(() => {
    saveTarife([]);
  }, [saveTarife]);

  return {
    tarife,
    tarifHinzufuegen,
    tarifAktualisieren,
    tarifLoeschen,
    alleTarifeLoeschen
  };
};

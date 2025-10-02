import { useState, useEffect } from 'react';
import type { Stromtarif } from '../types';

const STORAGE_KEY = 'stromtarife_data';

// Lokale Speicher-Funktionen
const saveToLocalStorage = (tarife: Stromtarif[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarife));
  } catch (error) {
    console.warn('Fehler beim Speichern:', error);
  }
};

const loadFromLocalStorage = (): Stromtarif[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Fehler beim Laden:', error);
    return [];
  }
};

export const useStromtarife = () => {
  const [tarife, setTarife] = useState<Stromtarif[]>([]);

  // Lade Tarife beim Start
  useEffect(() => {
    const savedTarife = loadFromLocalStorage();
    setTarife(savedTarife);
  }, []);

  // Speichere bei Änderungen
  useEffect(() => {
    saveToLocalStorage(tarife);
  }, [tarife]);

  const tarifHinzufuegen = (neuerTarif: Omit<Stromtarif, 'id'>) => {
    const id = Date.now().toString();
    const tarifMitId: Stromtarif = { ...neuerTarif, id };
    setTarife(prev => [...prev, tarifMitId]);
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

  // Import/Export Funktionen
  const exportTarife = () => {
    const dataStr = JSON.stringify(tarife, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `stromtarife_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTarife = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedTarife: Stromtarif[] = JSON.parse(content);
          
          // Validierung
          if (!Array.isArray(importedTarife)) {
            throw new Error('Ungültiges Dateiformat');
          }
          
          // Neue IDs vergeben falls nötig
          const tarifeWithNewIds = importedTarife.map(tarif => ({
            ...tarif,
            id: tarif.id || Date.now().toString() + Math.random().toString(36)
          }));
          
          setTarife(tarifeWithNewIds);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsText(file);
    });
  };

  return {
    tarife,
    tarifHinzufuegen,
    tarifAktualisieren,
    tarifLoeschen,
    alleTarifeLoeschen,
    exportTarife,
    importTarife
  };
};
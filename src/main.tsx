import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TestApp from './TestApp.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Debug-Ausgabe für GitHub Pages
console.log('🚀 App wird geladen...');
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Mode:', import.meta.env.MODE);

// Prüfe ob DOM bereit ist
console.log('DOM geladen:', document.readyState);
console.log('Root Element:', document.getElementById('root'));

// Test-Modus für Debugging (ändere zu false für normale App)
const TEST_MODE = true;

// Fallback für fehlende React-Umgebung
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element nicht gefunden');
  }

  console.log('✅ Root Element gefunden, starte React App...');
  
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        {TEST_MODE ? <TestApp /> : <App />}
      </ErrorBoundary>
    </StrictMode>,
  );
  
  console.log('✅ React App gestartet');
} catch (error) {
  console.error('❌ Fehler beim Starten der App:', error);
  
  // Fallback HTML anzeigen
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial; background: #1e293b; color: white; min-height: 100vh;">
        <h1 style="color: #ef4444;">⚠️ App konnte nicht geladen werden</h1>
        <p>Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
        <p>Bitte öffne die Browser-Konsole (F12) für weitere Details.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          🔄 Seite neu laden
        </button>
      </div>
    `;
  }
}

// Minimale Implementierung für GitHub Pages Debugging
console.log('🚀 Script geladen - Start');

// Global loadReactApp definieren
declare global {
  interface Window {
    loadReactApp: () => Promise<void>;
  }
}

// Warte bis DOM bereit ist
function initApp() {
  console.log('📋 DOM Status:', document.readyState);
  
  const rootElement = document.getElementById('root');
  console.log('🎯 Root Element:', rootElement);
  
  if (!rootElement) {
    console.error('❌ Root Element nicht gefunden!');
    return;
  }

  // Einfache HTML-Ausgabe ohne React (zum Testen)
  rootElement.innerHTML = `
    <div style="
      padding: 20px;
      text-align: center;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <h1 style="color: #10b981; margin-bottom: 20px; font-size: 2.5rem;">
        ✅ JavaScript läuft!
      </h1>
      <p style="margin-bottom: 20px; max-width: 600px; font-size: 1.2rem;">
        Die Stromtarif-Vergleichsanwendung ist bereit für React.
      </p>
      <div style="
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
      ">
        <h3 style="margin-bottom: 10px;">System-Info:</h3>
        <p><strong>URL:</strong> ${window.location.href}</p>
        <p><strong>User Agent:</strong> ${navigator.userAgent.substring(0, 50)}...</p>
        <p><strong>Zeit:</strong> ${new Date().toLocaleString('de-DE')}</p>
      </div>
      <button 
        onclick="window.loadReactApp()"
        style="
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.05)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        🚀 React App laden
      </button>
    </div>
  `;
  
  console.log('✅ Basis-App geladen');
}

// React App laden (falls Basis funktioniert)
window.loadReactApp = async function() {
  console.log('🔄 Lade React App...');
  
  try {
    // Dynamisch React-Module laden
    const { StrictMode, createElement } = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { default: App } = await import('./App.tsx');
    const { ErrorBoundary } = await import('./components/ErrorBoundary');
    
    // CSS laden
    await import('./index.css');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Root Element verloren');
    
    console.log('✅ Module geladen, starte React...');
    
    createRoot(rootElement).render(
      createElement(StrictMode, {}, 
        createElement(ErrorBoundary, { children: createElement(App) })
      )
    );
    
    console.log('✅ React App gestartet');
    
  } catch (error) {
    console.error('❌ React Fehler:', error);
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; background: #dc2626; color: white; min-height: 100vh;">
          <h1>❌ React Fehler</h1>
          <p>Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
          <pre style="background: rgba(0,0,0,0.3); padding: 10px; text-align: left; overflow: auto;">${error instanceof Error ? error.stack : ''}</pre>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: white; color: #dc2626; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
            🔄 Neu laden
          </button>
        </div>
      `;
    }
  }
};

// Start der App
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log('🏁 Script-Ende erreicht');

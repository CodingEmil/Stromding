import React from 'react';

// Minimale Test-App
const TestApp: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1e293b',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#10b981', marginBottom: '20px' }}>
        ✅ React App läuft!
      </h1>
      <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
        Die Stromtarif-Vergleichsanwendung ist erfolgreich geladen.
      </p>
      <div style={{
        padding: '20px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>System-Info:</h3>
        <p>Base URL: {import.meta.env.BASE_URL}</p>
        <p>Mode: {import.meta.env.MODE}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
      <button 
        onClick={() => window.location.href = '/Stromding/'}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔄 Vollständige App laden
      </button>
    </div>
  );
};

export default TestApp;
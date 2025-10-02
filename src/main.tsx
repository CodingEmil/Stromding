import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Debug-Ausgabe für GitHub Pages
console.log('🚀 App wird geladen...');
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Mode:', import.meta.env.MODE);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

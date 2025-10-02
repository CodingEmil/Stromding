# Copilot Instructions für Stromtarif-Vergleichswebsite

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

Dies ist eine React TypeScript Website zum Vergleichen von Stromtarifen mit folgenden Features:

## Projektstruktur
- React 18 mit TypeScript
- Vite als Build-Tool
- Chart.js für Datenvisualisierung
- Lucide React für Icons

## Hauptfunktionalitäten
1. **Tarif-Eingabe**: Formulare zum Hinzufügen von Stromtarifen mit:
   - Tarifname
   - Arbeitspreis (€/kWh)
   - Grundpreis (€/Monat)
   - Prämien/Boni (€)

2. **Tarif-Verwaltung**: 
   - Liste aller hinzugefügten Tarife
   - Bearbeiten und Löschen von Tarifen
   - Lokale Speicherung (localStorage)

3. **Interaktives Diagramm**:
   - X-Achse: Jahresverbrauch (kWh)
   - Y-Achse: Jahrespreis (€)
   - Mehrere Tariflinien gleichzeitig anzeigen
   - Hover-Tooltips mit Details

## Design-Guidelines
- Moderne, saubere UI
- Responsive Design
- Benutzerfreundliche Eingabeformulare
- Klare Datenvisualisierung
- Deutsche Sprache

## Code-Standards
- TypeScript für Typsicherheit
- Funktionale React-Komponenten mit Hooks
- Props-Interfaces definieren
- Responsive CSS oder Tailwind
- Kommentare auf Deutsch

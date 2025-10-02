# Stromtarif-Vergleichstool

Eine moderne React-TypeScript Webanwendung zum Vergleichen von Stromtarifen.

## Features

- ⚡ **Tarif-Eingabe**: Einfaches Hinzufügen von Stromtarifen mit Arbeitspreis, Grundpreis und Prämien
- 📋 **Tarif-Verwaltung**: Übersichtliche Liste aller Tarife mit automatischer Sortierung nach Kosten
- 📊 **Vergleichsdiagramm**: Grafische Darstellung der Jahreskosten bei verschiedenen Verbräuchen
- 💾 **Lokale Speicherung**: Alle Tarife werden automatisch im Browser gespeichert
- 📱 **Responsive Design**: Optimiert für Desktop und mobile Geräte

## Funktionen

### Tarif-Eingabe
- Tarifname und Anbieter
- Arbeitspreis (€/kWh)
- Grundpreis (€/Monat)
- Prämien/Boni (€)
- Vertragslaufzeit (optional)

### Vergleichsmöglichkeiten
- Sortierung nach Kosten bei verschiedenen Jahresverbräuchen
- Automatische Berechnung der günstigsten Option
- Darstellung der Mehrkosten gegenüber dem günstigsten Tarif
- Spartipps und Kostenvergleiche

### Grafische Darstellung
- Tabellarische Übersicht der Kosten bei verschiedenen Verbräuchen
- Farbkodierte Darstellung der Tarife
- Balkendiagramme für einfachen Vergleich
- Hervorhebung des günstigsten Tarifs

## Technologie-Stack

- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **LocalStorage** für Datenpersistierung

## Installation und Nutzung

1. Dependencies installieren:
   ```bash
   npm install
   ```

2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

3. Browser öffnen: http://localhost:5173

## Build für Produktion

```bash
npm run build
npm run preview
```

## Lizenz

MIT License

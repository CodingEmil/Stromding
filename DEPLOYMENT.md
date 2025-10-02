# Alternative Deployment Optionen

Da GitHub Pages nur mit öffentlichen Repositories funktioniert, hier sind Alternativen:

## 1. Repository öffentlich machen (einfachste Lösung)
- Gehe zu GitHub Repository Settings
- Scrolle zu "Danger Zone"
- Klicke "Change repository visibility" → "Make public"

## 2. Alternative kostenlose Hosting-Optionen:

### Netlify (empfohlen)
```bash
# Build erstellen
npm run build

# Netlify CLI installieren
npm install -g netlify-cli

# Deployment
netlify deploy --dir=dist --prod
```

### Vercel
```bash
# Build erstellen
npm run build

# Vercel CLI installieren
npm install -g vercel

# Deployment
vercel --prod
```

### Surge.sh
```bash
# Build erstellen
npm run build

# Surge CLI installieren
npm install -g surge

# Deployment
cd dist
surge . your-domain.surge.sh
```

## 3. Lokaler Server für Testing
```bash
# Nach dem Build
npm run build

# Lokaler Server
npx serve dist -p 3000
```

Dann öffne: http://localhost:3000
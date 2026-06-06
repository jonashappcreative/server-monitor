# Server Monitor Dashboard — Projekt-Brief

## 🎯 Projekt-Übersicht

Ein interaktives **Server Monitoring Dashboard**, das auf Hetzner läuft und Echtzeit-Daten über laufende Docker Container, System-Ressourcen (CPU, RAM, Disk) und Services zeigt.

**Zugänglich unter:** `https://server.jonashapp.com`  
**Domain:** jonashapp.com (All-Inkl)  
**Server:** Hetzner (IPv6: 2a01:4f8:c015:5f43::1)  

---

## 📋 Requirements

### Funktional
- ✅ System-Stats anzeigen (CPU, Memory, Disk, Uptime)
- ✅ Docker Container auflisten (Name, Status, CPU/Memory, Ports, Uptime)
- ✅ Running Services anzeigen (z.B. obsidian-bot, supabase, redis, nginx)
- ✅ Echtzeit-Updates (Auto-Refresh alle 5-10 Sekunden)
- ✅ Responsive Design (Desktop + Mobile)
- ✅ Clean, professionelle UI (keine Frameworks, vanilla JS)

### Technisch
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Backend:** Node.js + Express
- **Server-Kommunikation:** `/api/stats` Endpoint
- **Deployment:** Docker Container auf Hetzner
- **Reverse Proxy:** Nginx (localhost:3000 → server.jonashapp.com)
- **SSL:** Let's Encrypt (automatisch via Certbot)
- **Port:** 3000 (intern), 443/80 (extern via Nginx)

### Bekannte Docker Container
```
- obsidian-bot (Port 8080) — Groq-basierter Bot
- supabase-db (Port 5432) — PostgreSQL
- redis-cache (Port 6379) — Redis
- nginx (Port 80, 443) — Reverse Proxy
```

---

## 🛠️ Tech Stack

| Layer | Technologie | Begründung |
|-------|-------------|-----------|
| Frontend | HTML/CSS/JS (Vanilla) | Leicht, schnell, keine Abhängigkeiten |
| Backend | Node.js + Express | Einfach, CLI-Integration (docker ps, top, free, df) |
| Server Queries | Child Process (exec) | Direkte System-Befehle |
| Styling | CSS Variables | Design-System mit Dark/Light Mode |
| Hosting | Docker Container | Einfach zu deployen, isoliert |
| Reverse Proxy | Nginx | Schon installiert, bewährt |
| SSL | Let's Encrypt + Certbot | Kostenlos, automatisch erneuert |

---

## 📁 Verzeichnis-Struktur

```
server-monitor/
├── CLAUDE.md                    # Dieser Brief
├── package.json
├── server.js                    # Express Server + API
├── docker-compose.yml           # Optional: Container-Definition
├── nginx.conf                   # Nginx Reverse Proxy Config
├── public/
│   └── index.html              # Dashboard UI
├── scripts/
│   └── install.sh              # Setup-Script
└── README.md                    # Bedienungsanleitung
```

---

## 🚀 Phase-Plan

### Phase 1: Project Setup (✅ Vorarbeit)
- [x] GitHub Repo anlegen (private)
- [x] Hetzner Server SSH-Zugang prüfen
- [x] Node.js Version prüfen (`node -v`)
- [x] Docker verfügbar (`docker ps`)

### Phase 2: Backend API (Claude Code Session 1)
- [ ] `server.js` erstellen (Express + System-Commands)
  - [ ] `GET /api/stats` → CPU, Memory, Disk, Uptime
  - [ ] `GET /api/containers` → Docker Container-Info
  - [ ] `GET /api/health` → Health-Check
- [ ] `package.json` mit Dependencies (express, cors)
- [ ] Error Handling + Logging
- [ ] Lokal testen (`node server.js`)

### Phase 3: Frontend Dashboard (Claude Code Session 2)
- [ ] `public/index.html` erstellen (aus Mock-Design)
- [ ] Verbindung zur API (fetch /api/stats)
- [ ] Auto-Refresh implementieren (5s Intervall)
- [ ] Error States + Loading States
- [ ] Responsive Layout testen
- [ ] Dark Mode Support

### Phase 4: Docker & Deployment (Claude Code Session 3)
- [ ] `Dockerfile` erstellen
- [ ] `docker-compose.yml` schreiben (optional)
- [ ] Lokal im Docker testen
- [ ] Push zu GitHub

### Phase 5: Hetzner Deployment (Manuel via SSH)
- [ ] Git Repo auf Server clonen
- [ ] Docker Image bauen (`docker build`)
- [ ] Container starten (`docker run -p 3000:3000 ...`)
- [ ] Nginx Config einrichten
- [ ] Let's Encrypt SSL aktivieren
- [ ] HTTPS-Test
- [ ] Health-Check

---

## 📝 To-Do Liste — Detailliert

### 🔴 Kritisch (Muss erledigt sein)

#### Backend
- [ ] Express Server läuft auf localhost:3000
- [ ] `docker ps` Daten korrekt geparst
- [ ] System-Stats Commands funktionieren (top, free, df, uptime)
- [ ] CORS Headers gesetzt (für Frontend)
- [ ] JSON Responses validieren

#### Frontend
- [ ] API-Response wird eingelesen
- [ ] Stats (CPU, RAM, Disk) werden angezeigt
- [ ] Container-Liste wird gefüllt
- [ ] Auto-Refresh funktioniert
- [ ] Keine Console-Errors

#### Deployment
- [ ] Docker Image baut sauber
- [ ] Container startet ohne Fehler
- [ ] Nginx zeigt Dashboard auf server.jonashapp.com
- [ ] SSL-Zertifikat gültig

---

### 🟡 Wichtig (Sollte erledigt sein)

- [ ] Fehlerhafte API-Calls elegant handhaben (Fallback-UI)
- [ ] Loading-States während Daten-Abruf
- [ ] Responsive Design (Tablet-Ansicht testen)
- [ ] Dark Mode in CSS implementiert
- [ ] Keyboard-Navigation (Accessibility)
- [ ] Performance: Daten-Updates < 1s
- [ ] README mit Anleitung schreiben
- [ ] GitHub Repo dokumentiert

---

### 🟢 Nett zu haben (Optional)

- [ ] Container Logs anzeigen (klick auf Container)
- [ ] Restart-Button für Container
- [ ] Service Health-Status (Ping)
- [ ] Historical Daten (CPU/Memory Graph über Zeit)
- [ ] Mobile App (PWA)
- [ ] Slack/Email Alerts bei hoher Last
- [ ] Authentication (Basic Auth via Nginx)
- [ ] Multi-Server Support

---

## 🔧 Lokales Testing

```bash
# Abhängigkeiten installieren
npm install express cors

# Server lokal starten
node server.js

# In neuem Terminal testen
curl http://localhost:3000/api/stats
```

---

## 🚢 Deployment-Checklist

```bash
# 1. SSH auf Hetzner
ssh root@server.jonashapp.com

# 2. Repository clonen
cd /opt
git clone https://github.com/yourusername/server-monitor.git
cd server-monitor

# 3. Docker Image bauen
docker build -t server-monitor:latest .

# 4. Container starten
docker run -d \
  --name server-monitor \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  server-monitor:latest

# 5. Nginx neustarten
sudo systemctl reload nginx

# 6. HTTPS Test
curl https://server.jonashapp.com

# 7. Logs prüfen
docker logs server-monitor
```

---

## 🔐 Sicherheit

- [ ] Keine Secrets in Code (Environment Vars für API-Keys)
- [ ] Docker Socket sichere Permissions (`chmod 666 /var/run/docker.sock`)
- [ ] Optional: HTTP Basic Auth in Nginx
- [ ] Rate Limiting auf API (prevent DoS)
- [ ] CORS nur für eigene Domain

---

## 📊 API Endpoints (Spezifikation)

### `GET /api/stats`
**Response:**
```json
{
  "timestamp": "2026-06-06T14:00:00Z",
  "system": {
    "cpu": 35.2,
    "memory": 48.5,
    "disk": 62.1,
    "uptime": 45
  },
  "containers": [
    {
      "name": "obsidian-bot",
      "status": "running",
      "ports": "8080:8080",
      "uptime": "45d 12h"
    }
  ]
}
```

### `GET /api/health`
**Response:**
```json
{ "status": "ok", "uptime": 123456 }
```

---

## 📚 Ressourcen

- [Express Docs](https://expressjs.com/)
- [Docker CLI Docs](https://docs.docker.com/engine/reference/commandline/docker/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Let's Encrypt](https://letsencrypt.org/)

---

## 💬 Notizen

- **Hetzner IPv6:** Funktioniert wie IPv4, muss nur in Nginx `listen [::]:80;` sein
- **Docker Socket:** Braucht Mount `-v /var/run/docker.sock:/var/run/docker.sock`
- **System Commands:** Laufen direkt im Node Process (keine Sandbox, daher sauber halten)
- **Performance:** Bei >20 Containern könnte Pagination sinnvoll sein

---

## 🎬 Start-Anleitung

1. **GitHub Repo anlegen** → `server-monitor` (private)
2. **VS Code öffnen** → Clone Repo lokal
3. **Claude Code starten** → Diesen Brief laden
4. **Phase 2 beginnen** → Backend API schreiben
5. **Iterativ** → Frontend, Docker, Deploy

---

**Letzte Aktualisierung:** 6. Juni 2026  
**Status:** Bereit für Claude Code (Phase 2)  
**Estimated Duration:** 3-4 Stunden (Backend + Frontend) + 30 Min (Deployment)

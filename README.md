# server-monitor
# 🖥️ Server Monitor Dashboard

Ein **Echtzeit-Monitoring Dashboard** für deinen Hetzner Server. Zeigt Docker Container, System-Ressourcen und laufende Services.

**Live unter:** `https://server.jonashapp.com`

---

## 📋 Features

- ✅ **System Stats**: CPU, RAM, Disk, Uptime
- ✅ **Docker Container**: Live Status, Ports, Ressourcen
- ✅ **Services**: Running Services mit Health-Status
- ✅ **Echtzeit Updates**: Auto-Refresh alle 5 Sekunden
- ✅ **Responsive Design**: Desktop & Mobile
- ✅ **Dark/Light Mode**: Automatisch basierend auf System-Präferenzen
- ✅ **SSL/HTTPS**: Let's Encrypt zertifikat

---

## 🚀 Quick Start (Lokal)

### 1. Dependencies installieren
```bash
npm install
```

### 2. Server starten
```bash
npm start
# oder: node server.js
```

### 3. Browser öffnen
```
http://localhost:3000
```

---

## 🐳 Docker Deployment

### Mit docker-compose (empfohlen)

```bash
# Image bauen
docker-compose build

# Container starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f server-monitor

# Stoppen
docker-compose down
```

### Manuell mit docker run

```bash
# Image bauen
docker build -t server-monitor:latest .

# Container starten (mit Docker Socket für docker ps)
docker run -d \
  --name server-monitor \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  server-monitor:latest

# Logs anschauen
docker logs -f server-monitor

# Container stoppen
docker stop server-monitor
docker rm server-monitor
```

---

## 🌐 Production Deployment (Hetzner)

### Voraussetzungen
- SSH Zugang zum Hetzner Server
- Domain eingerichtet (`server.jonashapp.com` mit AAAA Record)
- Nginx installiert
- Let's Encrypt / Certbot verfügbar

### Schritt-für-Schritt

#### 1. Repository auf Server clonen
```bash
ssh root@server.jonashapp.com

cd /opt
git clone https://github.com/your-username/server-monitor.git
cd server-monitor
```

#### 2. Docker Image bauen
```bash
docker build -t server-monitor:latest .
```

#### 3. Container mit docker-compose starten
```bash
docker-compose up -d
```

Oder manuell:
```bash
docker run -d \
  --name server-monitor \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  server-monitor:latest
```

#### 4. Nginx konfigurieren

Nginx Config kopieren:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/server-monitor
sudo ln -s /etc/nginx/sites-available/server-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL mit Let's Encrypt

```bash
sudo certbot --nginx -d server.jonashapp.com
```

Das erledigt alles automatisch:
- Zertifikat generieren
- Nginx Config updaten
- Auto-Renewal konfigurieren

#### 6. Fertig! 🎉

Öffne `https://server.jonashapp.com` im Browser.

---

## 🔧 API Endpoints

### `GET /api/health`
Health Check - antwortet mit `{ "status": "ok" }`

### `GET /api/stats`
Alle Daten (System + Container + Services)

**Response:**
```json
{
  "timestamp": "2026-06-06T14:00:00Z",
  "system": {
    "cpu": 35.2,
    "memory": 8.4,
    "memoryTotal": 16,
    "disk": 62.1,
    "uptime": 45
  },
  "containers": [
    {
      "name": "obsidian-bot",
      "status": "running",
      "ports": "8080:8080",
      "uptime": "45d"
    }
  ],
  "services": [
    {
      "name": "Obsidian Bot",
      "url": "obsidian-bot.jonashapp.com",
      "status": "running",
      "port": 8080
    }
  ]
}
```

### `GET /api/system`
Nur System-Stats

### `GET /api/containers`
Nur Docker Container

### `GET /api/services`
Nur Services

---

## ⚙️ Konfiguration

### Umgebungsvariablen

```bash
export PORT=3000              # Port für den Server
export NODE_ENV=production    # Oder: development
```

### Docker Socket Zugriff

Der Container braucht Zugriff auf `/var/run/docker.sock` um `docker ps` auszuführen:

```bash
-v /var/run/docker.sock:/var/run/docker.sock:ro
```

**Sicherheit:** Das ist `:ro` (read-only). Der Container kann nur auslesen, nicht ändern.

---

## 🔐 Sicherheit

### Bereits implementiert
- ✅ HTTPS/SSL (Let's Encrypt)
- ✅ Security Headers (HSTS, X-Frame-Options, etc.)
- ✅ Docker Socket als read-only
- ✅ CORS konfiguriert
- ✅ Timeouts gesetzt

### Optional: Basic Auth

Falls du das Dashboard schützen möchtest:

```bash
# Passwort-File erstellen
sudo htpasswd -c /etc/nginx/.htpasswd monitor
# Passwort eingeben

# In /etc/nginx/sites-available/server-monitor hinzufügen:
# auth_basic "Server Monitor";
# auth_basic_user_file /etc/nginx/.htpasswd;

sudo nginx -t && sudo systemctl reload nginx
```

### Optional: Rate Limiting

```nginx
# In /etc/nginx/nginx.conf (vor server blocks):
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;

# In der /api/ location:
limit_req zone=api_limit burst=5 nodelay;
```

---

## 📊 Überwachung

### Logs anschauen
```bash
# Docker Logs
docker logs server-monitor
docker logs -f server-monitor  # Follow mode

# Nginx Logs
tail -f /var/log/nginx/server-monitor-access.log
tail -f /var/log/nginx/server-monitor-error.log
```

### Health Check
```bash
curl https://server.jonashapp.com/api/health
```

### Container Status
```bash
docker ps | grep server-monitor
```

---

## 🛠️ Entwicklung

### VS Code mit Claude Code

Öffne den Claude Code Prompt mit `CLAUDE.md` für die komplette Entwicklungsanleitung.

```bash
# Dev Mode (mit Auto-Reload)
npm install -D nodemon
nodemon server.js
```

### Git Workflow

```bash
git add .
git commit -m "Feat: Add new feature"
git push origin main
```

Auf dem Server:
```bash
cd /opt/server-monitor
git pull
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Dashboard lädt nicht

```bash
# 1. Container läuft?
docker ps | grep server-monitor

# 2. Port 3000 offen?
sudo lsof -i :3000

# 3. Nginx proxy arbeitet?
curl http://localhost:3000/api/health

# 4. DNS korrekt?
nslookup server.jonashapp.com
```

### Docker Stats funktionieren nicht

```bash
# Docker Socket Zugriff prüfen
ls -la /var/run/docker.sock

# Falls Fehler:
sudo chmod 666 /var/run/docker.sock
```

### SSL Zertifikat Problem

```bash
# Certbot Status
sudo certbot certificates

# Auto-Renewal testen
sudo certbot renew --dry-run

# Let's Encrypt Logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📈 Performance Tips

- Container-Limits setzen (docker-compose)
- Nginx Caching für statische Dateien aktiviert
- API Responses sind JSON (leicht)
- Refresh-Interval: 5 Sekunden (kann angepasst werden)

---

## 📝 Lizenz

MIT

---

## 👤 Autor

Jonas  
Portfolio: https://jonashapp.com

---

## 🤝 Support

Probleme? Schreib ein Issue auf GitHub oder kontaktiere mich.

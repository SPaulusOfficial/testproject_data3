# Backend Server Debug Guide

## 🔍 Debug-Logs aktiviert

Der Backend-Server wurde mit umfassenden Debug-Logs ausgestattet, um herauszufinden, warum er immer wieder abstürzt.

## 📁 Log-Dateien

- `logs/error.log` - Alle Fehler mit Stack-Traces
- `logs/server-debug.log` - Vollständige Server-Logs im Debug-Modus
- `logs/server-monitor.log` - Logs vom Monitoring-Skript

## 🚀 Server starten

### Normaler Start
```bash
cd BlueDevil/backend
node server.js
```

### Debug-Modus
```bash
cd BlueDevil/backend
./start-debug.sh
```

### Mit Monitoring (Auto-Restart bei Absturz)
```bash
cd BlueDevil/backend
./monitor-server.sh
```

## 🔍 Debug-Logs verstehen

### Log-Levels
- `🔧` - Server-Konfiguration
- `🗄️` - Datenbank-Operationen
- `🔐` - Authentifizierung
- `👥` - Benutzer-Management
- `📁` - Projekt-Management
- `🔔` - Benachrichtigungen
- `🏥` - Health Checks
- `❌` - Fehler
- `✅` - Erfolgreiche Operationen

### Debug-Namespaces
- `server:main` - Hauptserver-Logs
- `server:database` - Datenbank-Logs
- `server:auth` - Authentifizierungs-Logs
- `server:api` - API-Endpunkt-Logs

## 🐛 Häufige Probleme

### 1. Datenbank-Verbindung
- Überprüfe PostgreSQL läuft auf Port 5434
- Überprüfe Benutzer `cas_user` existiert
- Überprüfe Datenbank `platform_db` existiert

### 2. Umgebungsvariablen
- Überprüfe `.env` Datei existiert
- Überprüfe alle erforderlichen Variablen sind gesetzt

### 3. Berechtigungen
- Überprüfe Datei-Berechtigungen für Logs-Verzeichnis
- Überprüfe Datenbank-Berechtigungen

## 🔧 Troubleshooting

### Server startet nicht
```bash
# Überprüfe Port-Verfügbarkeit
lsof -i :3002

# Überprüfe Datenbank-Verbindung
psql -h localhost -p 5434 -U cas_user -d platform_db
```

### Server stürzt ab
```bash
# Überprüfe Logs
tail -f logs/error.log

# Überprüfe System-Logs
dmesg | tail -20
```

### Performance-Probleme
```bash
# Überprüfe Speicher-Nutzung
top -p $(pgrep node)

# Überprüfe Datenbank-Performance
psql -h localhost -p 5434 -U cas_user -d platform_db -c "SELECT * FROM pg_stat_activity;"
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3002/api/health
```

### Database Health Check
```bash
curl http://localhost:3002/api/health/db
```

### Debug Token Check
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/api/debug/token
```

## 🛠️ Debug-Modi

### Vollständiger Debug-Modus
```bash
DEBUG=server:* node server.js
```

### Nur Datenbank-Debug
```bash
DEBUG=server:database node server.js
```

### Nur API-Debug
```bash
DEBUG=server:api node server.js
```

## 📝 Log-Analyse

### Fehler finden
```bash
grep "ERROR" logs/error.log
```

### Datenbank-Fehler
```bash
grep "DATABASE" logs/error.log
```

### API-Fehler
```bash
grep "API_ERROR" logs/error.log
```

## 🔄 Auto-Restart

Das Monitoring-Skript überwacht den Server und startet ihn automatisch neu, falls er abstürzt:

```bash
./monitor-server.sh
```

## 📞 Support

Bei Problemen:
1. Überprüfe alle Log-Dateien
2. Teste Datenbank-Verbindung
3. Überprüfe Umgebungsvariablen
4. Starte Server im Debug-Modus
5. Kontaktiere das Entwicklungsteam mit Logs

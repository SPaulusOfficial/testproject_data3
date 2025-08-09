# Backend Server Management

## 🚀 Server-Verwaltung

### Server starten
```bash
./start-server.sh
```
- Startet den Server im Hintergrund
- Erstellt automatisch Log-Dateien
- Überprüft, ob der Server erfolgreich gestartet ist
- Zeigt nützliche Befehle an

### Server stoppen
```bash
./stop-server.sh
```
- Stoppt den Server sauber
- Verwendet PID-Datei für sicheres Beenden
- Falls nötig, erzwingt das Beenden mit kill -9

### Server neu starten
```bash
./restart-server.sh
```
- Stoppt den Server
- Startet ihn neu
- Nützlich für Updates oder nach Änderungen

### Server-Status überprüfen
```bash
curl http://localhost:3002/api/health
```

### Logs anzeigen
```bash
# Alle Logs
tail -f logs/server.log

# Nur Fehler
grep "ERROR" logs/server.log

# Nur Debug-Logs
grep "server:" logs/server.log
```

## 🔍 Debug-Modi

### Debug-Modus (Vordergrund)
```bash
./start-debug.sh
```
- Startet Server im Vordergrund mit Debug-Logs
- Nützlich für Entwicklung und Troubleshooting

### Monitoring-Modus
```bash
./monitor-server.sh
```
- Überwacht Server-Status
- Startet automatisch neu bei Absturz
- Läuft kontinuierlich

## 📁 Log-Dateien

- `logs/server.log` - Standard-Server-Logs
- `logs/server-debug.log` - Debug-Logs (wenn mit start-debug.sh gestartet)
- `logs/error.log` - Fehler-Logs (wenn Fehler auftreten)
- `logs/server.pid` - Process ID für sauberes Beenden

## 🔧 Troubleshooting

### Server startet nicht
```bash
# Port überprüfen
lsof -i :3002

# Prozess beenden
lsof -ti:3002 | xargs kill -9

# Logs überprüfen
tail -f logs/server.log
```

### Server stürzt ab
```bash
# Fehler-Logs überprüfen
tail -f logs/error.log

# Debug-Modus starten
./start-debug.sh

# Monitoring aktivieren
./monitor-server.sh
```

### Server antwortet nicht
```bash
# Health Check
curl http://localhost:3002/api/health

# Database Health Check
curl http://localhost:3002/api/health/db

# Server neu starten
./restart-server.sh
```

## 📊 Monitoring

### Automatisches Monitoring
```bash
./monitor-server.sh
```
- Überwacht Server alle 30 Sekunden
- Startet automatisch neu bei Absturz
- Protokolliert alle Neustarts

### Manuelles Monitoring
```bash
# Server-Status
curl -s http://localhost:3002/api/health | jq .

# Datenbank-Status
curl -s http://localhost:3002/api/health/db | jq .

# Prozess-Status
ps aux | grep node
```

## 🛠️ Entwicklung

### Entwicklung mit Debug-Logs
```bash
./start-debug.sh
```
- Startet Server im Vordergrund
- Zeigt alle Debug-Logs in Echtzeit
- Nützlich für Entwicklung

### Hot Reload (für Entwicklung)
```bash
npm install -g nodemon
nodemon server.js
```

## 📋 Nützliche Befehle

### Server-Verwaltung
```bash
./start-server.sh    # Server starten
./stop-server.sh     # Server stoppen
./restart-server.sh  # Server neu starten
./start-debug.sh     # Debug-Modus
./monitor-server.sh  # Monitoring
```

### Log-Verwaltung
```bash
tail -f logs/server.log           # Logs verfolgen
grep "ERROR" logs/server.log      # Fehler finden
grep "server:" logs/server.log    # Debug-Logs
```

### System-Verwaltung
```bash
lsof -i :3002                    # Port-Status
ps aux | grep node               # Node-Prozesse
kill -9 $(lsof -ti:3002)        # Port freigeben
```

## ✅ Status-Checks

### Server läuft
```bash
curl -s http://localhost:3002/api/health
# Erwartete Antwort: {"status":"healthy",...}
```

### Datenbank verbunden
```bash
curl -s http://localhost:3002/api/health/db
# Erwartete Antwort: {"status":"healthy","database":"connected"}
```

### Login funktioniert
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Erwartete Antwort: {"token":"...","user":{...}}
```

## 🚨 Notfall-Prozeduren

### Server antwortet nicht
1. `./stop-server.sh`
2. `./start-server.sh`
3. `curl http://localhost:3002/api/health`

### Server stürzt immer wieder ab
1. `./start-debug.sh` (für Debug-Logs)
2. Logs überprüfen: `tail -f logs/server-debug.log`
3. Fehler analysieren und beheben

### Port ist belegt
1. `lsof -ti:3002 | xargs kill -9`
2. `./start-server.sh`

### Datenbank-Probleme
1. PostgreSQL-Status überprüfen
2. Datenbank-Verbindung testen
3. `.env` Datei überprüfen

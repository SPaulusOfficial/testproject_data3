# Enhanced Backend Logging - Dokumentation

## 🔍 **Übersicht**

Das Backend wurde mit erweiterten Logging-Funktionen ausgestattet, um zu verstehen, warum der Server gekillt wird und welche Probleme auftreten.

## 📊 **Neue Logging-Features**

### **1. Erweiterte Process Monitoring**

#### **Server-Statistiken**
```javascript
let serverStartTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let lastErrorTime = null;
```

#### **Crash Reports**
- ✅ **Uncaught Exception Logging**
- ✅ **Unhandled Rejection Logging**
- ✅ **Memory Usage Tracking**
- ✅ **Uptime Monitoring**
- ✅ **Request/Error Counting**

### **2. Enhanced Request Logging**

#### **Request Tracking**
```javascript
// Logs: Request #123, Response Time, Status Code
📥 [2025-08-09T13:11:19.250Z] GET /api/health - IP: ::1 - Request #1
📤 [2025-08-09T13:11:19.251Z] GET /api/health - Status: 200 - Time: 1ms
```

#### **Performance Monitoring**
- ✅ **Slow Request Detection** (>5s)
- ✅ **Error Response Tracking** (4xx/5xx)
- ✅ **Response Time Logging**
- ✅ **Request Counter**

### **3. Memory Monitoring**

#### **Automatic Memory Checks**
```javascript
// Check every 30 seconds
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  
  if (heapUsedMB > 500) { // Warning at 500MB
    console.warn(`⚠️  High memory usage: ${heapUsedMB}MB`);
  }
}, 30000);
```

### **4. Heartbeat Monitoring**

#### **Regular Health Checks**
```javascript
// Log every 10 minutes
💓 Heartbeat - Uptime: 600s, Requests: 150, Errors: 2, Memory: 45MB
```

## 📁 **Log-Dateien**

### **1. `logs/error.log`**
```json
{
  "timestamp": "2025-08-09T13:11:19.250Z",
  "context": "UNCAUGHT_EXCEPTION",
  "error": "Connection timeout",
  "stack": "Error: Connection timeout\n    at getPool...",
  "code": "ECONNRESET"
}
```

### **2. `logs/crash.log`**
```json
{
  "timestamp": "2025-08-09T13:11:19.250Z",
  "type": "UNCAUGHT_EXCEPTION",
  "uptime": 3600000,
  "requestCount": 1500,
  "errorCount": 5,
  "memoryUsage": {
    "heapUsed": 47185920,
    "heapTotal": 67108864,
    "external": 1234567
  },
  "error": {
    "message": "Connection timeout",
    "stack": "Error: Connection timeout...",
    "code": "ECONNRESET"
  }
}
```

### **3. `logs/shutdown.log`**
```json
{
  "timestamp": "2025-08-09T13:11:19.250Z",
  "type": "GRACEFUL_SHUTDOWN",
  "signal": "SIGTERM",
  "uptime": 3600000,
  "requestCount": 1500,
  "errorCount": 5,
  "memoryUsage": {...},
  "lastErrorTime": 1754692279250
}
```

### **4. `logs/exit.log`**
```json
{
  "timestamp": "2025-08-09T13:11:19.250Z",
  "type": "PROCESS_EXIT",
  "code": 1,
  "uptime": 3600000,
  "requestCount": 1500,
  "errorCount": 5,
  "memoryUsage": {...}
}
```

### **5. `logs/heartbeat.log`**
```json
{
  "timestamp": "2025-08-09T13:11:19.250Z",
  "type": "HEARTBEAT",
  "uptime": 3600000,
  "requestCount": 1500,
  "errorCount": 5,
  "memoryUsage": {...}
}
```

## 🔧 **Monitoring Commands**

### **1. Live Logs anzeigen**
```bash
# Alle Logs
tail -f logs/server.log

# Nur Errors
tail -f logs/error.log

# Crash Reports
tail -f logs/crash.log

# Heartbeat
tail -f logs/heartbeat.log
```

### **2. Server Status prüfen**
```bash
# Health Check
curl -s http://localhost:3002/api/health

# Database Health
curl -s http://localhost:3002/api/health/db
```

### **3. Memory Usage überwachen**
```bash
# Process Memory
ps aux | grep node

# Memory Logs
grep "Memory usage" logs/server.log
```

## 🚨 **Crash Detection**

### **1. Uncaught Exceptions**
```javascript
process.on('uncaughtException', (error) => {
  console.error('💥 CRITICAL: Server crashed due to uncaught exception');
  console.error(`📊 Server Stats:`);
  console.error(`   - Uptime: ${Math.round(uptime / 1000)}s`);
  console.error(`   - Requests handled: ${requestCount}`);
  console.error(`   - Errors encountered: ${errorCount}`);
  console.error(`   - Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
});
```

### **2. Unhandled Rejections**
```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 CRITICAL: Server crashed due to unhandled promise rejection');
  // Same detailed logging as above
});
```

### **3. Signal Handlers**
```javascript
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM - Starting graceful shutdown...');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT - Starting graceful shutdown...');
  gracefulShutdown('SIGINT');
});
```

## 📈 **Performance Monitoring**

### **1. Request Performance**
```javascript
// Slow request detection (>5s)
if (responseTime > 5000) {
  console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
  logError(new Error(`Slow request: ${responseTime}ms`), `SLOW_REQUEST_${req.method}_${req.path}`);
}
```

### **2. Error Tracking**
```javascript
// Error response tracking
if (statusCode >= 400) {
  errorCount++;
  lastErrorTime = Date.now();
  console.error(`❌ Error response: ${req.method} ${req.path} - Status: ${statusCode}`);
}
```

### **3. Memory Warnings**
```javascript
if (heapUsedMB > 500) { // Warning at 500MB
  console.warn(`⚠️  High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
  logError(new Error(`High memory usage: ${heapUsedMB}MB`), 'MEMORY_WARNING');
}
```

## 🎯 **Troubleshooting**

### **1. Server wird gekillt**
```bash
# Prüfe Crash Logs
tail -f logs/crash.log

# Prüfe Exit Logs
tail -f logs/exit.log

# Prüfe Memory Usage
grep "Memory usage" logs/server.log
```

### **2. Hohe Memory Usage**
```bash
# Memory Warnings
grep "High memory usage" logs/server.log

# Memory Leaks
grep "MEMORY_WARNING" logs/error.log
```

### **3. Slow Requests**
```bash
# Slow Request Logs
grep "Slow request" logs/server.log

# Performance Issues
grep "SLOW_REQUEST" logs/error.log
```

### **4. Database Issues**
```bash
# Database Errors
grep "DATABASE" logs/error.log

# Connection Issues
grep "ECONNRESET\|ETIMEDOUT" logs/error.log
```

## 🔍 **Debugging Commands**

### **1. Server Status**
```bash
# Process Info
ps aux | grep node

# Port Usage
lsof -i :3002

# Memory Usage
top -p $(pgrep node)
```

### **2. Log Analysis**
```bash
# Error Summary
grep "ERROR" logs/server.log | wc -l

# Request Summary
grep "Request #" logs/server.log | tail -1

# Memory Summary
grep "Memory usage" logs/server.log | tail -5
```

### **3. Real-time Monitoring**
```bash
# Live Server Logs
tail -f logs/server.log

# Live Error Logs
tail -f logs/error.log

# Live Heartbeat
tail -f logs/heartbeat.log
```

## 📊 **Monitoring Dashboard**

### **Server Stats (Live)**
```bash
# Start Monitoring Script
./monitor-server.sh

# Expected Output:
🔍 Starting server monitor...
🔍 Checking server status...
✅ Server is running
💓 Heartbeat - Uptime: 600s, Requests: 150, Errors: 2, Memory: 45MB
```

### **Health Check**
```bash
curl -s http://localhost:3002/api/health | jq

# Expected Response:
{
  "status": "healthy",
  "timestamp": "2025-08-09T13:11:19.250Z",
  "service": "Salesfive Platform API"
}
```

## 🎯 **Ergebnis**

### **✅ Implementiert:**
- ✅ **Enhanced Crash Detection** - Detaillierte Crash Reports
- ✅ **Memory Monitoring** - Automatische Memory-Leak Detection
- ✅ **Performance Tracking** - Slow Request Detection
- ✅ **Request Counting** - Request/Error Statistics
- ✅ **Heartbeat Monitoring** - Regular Health Checks
- ✅ **Graceful Shutdown** - Proper Cleanup on Exit
- ✅ **Multiple Log Files** - Separate Logs für verschiedene Events

### **✅ Monitoring:**
- ✅ **Real-time Logs** - Live Monitoring möglich
- ✅ **Crash Analysis** - Detaillierte Crash Reports
- ✅ **Performance Metrics** - Request/Response Times
- ✅ **Memory Tracking** - Heap Usage Monitoring
- ✅ **Error Tracking** - Comprehensive Error Logging

### **✅ Debugging:**
- ✅ **Crash Logs** - `logs/crash.log`
- ✅ **Error Logs** - `logs/error.log`
- ✅ **Shutdown Logs** - `logs/shutdown.log`
- ✅ **Exit Logs** - `logs/exit.log`
- ✅ **Heartbeat Logs** - `logs/heartbeat.log`

Jetzt können wir genau sehen, warum das Backend gekillt wird! 🎉

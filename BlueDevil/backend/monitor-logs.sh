#!/bin/bash

echo "🔍 Enhanced Logging Monitor"
echo "=========================="
echo ""

# Check if server is running
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

echo ""
echo "📊 Current Server Stats:"
echo "========================"

# Get latest server stats from logs
echo "📈 Recent Activity:"
tail -n 5 logs/server.log | grep -E "(Request #|Status:|Time:)" | tail -3

echo ""
echo "🚨 Recent Errors:"
if [ -f logs/error.log ]; then
    tail -n 3 logs/error.log | jq -r '.timestamp + " - " + .context + ": " + .error' 2>/dev/null || tail -n 3 logs/error.log
else
    echo "   No error logs found"
fi

echo ""
echo "💥 Recent Crashes:"
if [ -f logs/crash.log ]; then
    tail -n 1 logs/crash.log | jq -r '.timestamp + " - " + .type + " (Uptime: " + (.uptime/1000|floor) + "s, Requests: " + .requestCount + ", Errors: " + .errorCount + ")"' 2>/dev/null || tail -n 1 logs/crash.log
else
    echo "   No crash logs found"
fi

echo ""
echo "💓 Latest Heartbeat:"
if [ -f logs/heartbeat.log ]; then
    tail -n 1 logs/heartbeat.log | jq -r '.timestamp + " - Uptime: " + (.uptime/1000|floor) + "s, Requests: " + .requestCount + ", Errors: " + .errorCount + ", Memory: " + (.memoryUsage.heapUsed/1024/1024|floor) + "MB"' 2>/dev/null || tail -n 1 logs/heartbeat.log
else
    echo "   No heartbeat logs found"
fi

echo ""
echo "🛑 Recent Shutdowns:"
if [ -f logs/shutdown.log ]; then
    tail -n 1 logs/shutdown.log | jq -r '.timestamp + " - " + .signal + " (Uptime: " + (.uptime/1000|floor) + "s)"' 2>/dev/null || tail -n 1 logs/shutdown.log
else
    echo "   No shutdown logs found"
fi

echo ""
echo "📁 Available Log Files:"
echo "======================="
ls -la logs/ | grep -E "\.(log|txt)$" | awk '{print "   " $9 " (" $5 " bytes)"}'

echo ""
echo "🔧 Monitoring Commands:"
echo "======================"
echo "   Live server logs:    tail -f logs/server.log"
echo "   Live error logs:     tail -f logs/error.log"
echo "   Live crash logs:     tail -f logs/crash.log"
echo "   Live heartbeat:      tail -f logs/heartbeat.log"
echo "   Memory usage:        grep 'Memory usage' logs/server.log | tail -5"
echo "   Slow requests:       grep 'Slow request' logs/server.log"
echo "   Error summary:       grep 'ERROR' logs/server.log | wc -l"
echo "   Request count:       grep 'Request #' logs/server.log | tail -1"

echo ""
echo "🎯 Quick Health Check:"
echo "====================="

# Check memory usage
MEMORY_USAGE=$(grep "Memory usage" logs/server.log | tail -1 | grep -o '[0-9]\+MB' | head -1)
if [ ! -z "$MEMORY_USAGE" ]; then
    MEMORY_NUM=$(echo $MEMORY_USAGE | sed 's/MB//')
    if [ $MEMORY_NUM -gt 500 ]; then
        echo "⚠️  High memory usage: $MEMORY_USAGE"
    else
        echo "✅ Memory usage: $MEMORY_USAGE"
    fi
else
    echo "ℹ️  Memory usage: Not available"
fi

# Check error rate
ERROR_COUNT=$(grep "ERROR" logs/server.log | wc -l)
REQUEST_COUNT=$(grep "Request #" logs/server.log | wc -l)
if [ $REQUEST_COUNT -gt 0 ]; then
    ERROR_RATE=$((ERROR_COUNT * 100 / REQUEST_COUNT))
    if [ $ERROR_RATE -gt 10 ]; then
        echo "⚠️  High error rate: ${ERROR_RATE}% ($ERROR_COUNT errors / $REQUEST_COUNT requests)"
    else
        echo "✅ Error rate: ${ERROR_RATE}% ($ERROR_COUNT errors / $REQUEST_COUNT requests)"
    fi
else
    echo "ℹ️  Error rate: No requests yet"
fi

# Check for recent crashes
if [ -f logs/crash.log ] && [ $(wc -l < logs/crash.log) -gt 0 ]; then
    LAST_CRASH=$(tail -n 1 logs/crash.log | jq -r '.timestamp' 2>/dev/null)
    if [ ! -z "$LAST_CRASH" ] && [ "$LAST_CRASH" != "null" ]; then
        echo "⚠️  Last crash: $LAST_CRASH"
    else
        echo "✅ No recent crashes"
    fi
else
    echo "✅ No crashes recorded"
fi

echo ""
echo "🚀 Server is ready for monitoring!"

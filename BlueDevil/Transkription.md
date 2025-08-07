# Meeting Assistant API Dokumentation

## 📋 Übersicht

Die Meeting Assistant API ermöglicht die Verwaltung von Meetings und Transkriptionen. Alle Endpunkte erfordern einen API-Key im Header `x-api-key`.

**Base URL:** `http://localhost:3221`  
**API Key:** `test123`

---

## 🔐 Authentifizierung

Alle API-Aufrufe erfordern den API-Key im Header:

```http
x-api-key: test123
```

---

## 📊 Datenbank Schema

### Meetings Tabelle
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transcripts Tabelle
```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id),
  audio_type VARCHAR(50), -- 'tab' oder 'microphone'
  transcript TEXT,
  audio_file VARCHAR(255),
  audio_size INTEGER,
  chunk_start_time TIMESTAMP,
  chunk_end_time TIMESTAMP,
  chunk_duration INTEGER, -- in Millisekunden
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 API Endpunkte

### 1. Meeting erstellen

**POST** `/meetings`

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Wöchentliches Team-Update"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Team Meeting",
  "description": "Wöchentliches Team-Update",
  "created_at": "2025-07-27T19:15:00.000Z",
  "updated_at": "2025-07-27T19:15:00.000Z"
}
```

**cURL Beispiel:**
```bash
curl -X POST http://localhost:3221/meetings \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{"title": "Team Meeting", "description": "Wöchentliches Team-Update"}'
```

---

### 2. Alle Meetings abrufen

**GET** `/meetings`

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Meeting",
    "description": "Wöchentliches Team-Update",
    "created_at": "2025-07-27T19:15:00.000Z",
    "updated_at": "2025-07-27T19:15:00.000Z",
    "transcript_count": "5"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Test Meeting",
    "description": "Ein Test-Meeting",
    "created_at": "2025-07-27T19:20:00.000Z",
    "updated_at": "2025-07-27T19:20:00.000Z",
    "transcript_count": "0"
  }
]
```

**cURL Beispiel:**
```bash
curl -X GET http://localhost:3221/meetings \
  -H "x-api-key: test123"
```

---

### 3. Spezifisches Meeting mit Transkripten abrufen

**GET** `/meetings/:id`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Team Meeting",
  "description": "Wöchentliches Team-Update",
  "created_at": "2025-07-27T19:15:00.000Z",
  "updated_at": "2025-07-27T19:15:00.000Z",
  "transcripts": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "audio_type": "tab",
      "transcript": "Das Wort Matratze kommt aus dem Arabischen und bezeichnet ursprünglich ein Bodenkissen.",
      "audio_file": "debug-audio-tab-1753644892399.webm",
      "audio_size": 319907,
      "chunk_start_time": "2025-07-27T19:34:32.496Z",
      "chunk_end_time": "2025-07-27T19:34:52.393Z",
      "chunk_duration": 19897,
      "created_at": "2025-07-27T19:34:54.244Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "audio_type": "microphone",
      "transcript": "Ich kann mich noch an meine Jugend erinnern, da hatten wir zumeist dreiteilige Matratzen.",
      "audio_file": "debug-audio-microphone-1753644952399.webm",
      "audio_size": 280889,
      "chunk_start_time": "2025-07-27T19:35:32.492Z",
      "chunk_end_time": "2025-07-27T19:35:52.394Z",
      "chunk_duration": 19902,
      "created_at": "2025-07-27T19:35:54.896Z"
    }
  ]
}
```

**cURL Beispiel:**
```bash
curl -X GET "http://localhost:3221/meetings/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 4. Meeting löschen

**DELETE** `/meetings/:id`

**Response (200):**
```json
{
  "message": "Meeting deleted successfully"
}
```

**cURL Beispiel:**
```bash
curl -X DELETE "http://localhost:3221/meetings/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 5. Transkripte durchsuchen

**GET** `/search?q=term&meetingId=optional`

**Parameter:**
- `q` (required): Suchbegriff
- `meetingId` (optional): Spezifisches Meeting für die Suche

**Response (200):**
```json
[
  {
    "meeting_id": "550e8400-e29b-41d4-a716-446655440000",
    "meeting_title": "Team Meeting",
    "transcript_id": "770e8400-e29b-41d4-a716-446655440002",
    "audio_type": "tab",
    "transcript": "Das Wort Matratze kommt aus dem Arabischen und bezeichnet ursprünglich ein Bodenkissen.",
    "chunk_start_time": "2025-07-27T19:34:32.496Z",
    "chunk_end_time": "2025-07-27T19:34:52.393Z",
    "created_at": "2025-07-27T19:34:54.244Z"
  }
]
```

**cURL Beispiele:**
```bash
# Suche in allen Transkripten
curl -X GET "http://localhost:3221/search?q=Matratze" \
  -H "x-api-key: test123"

# Suche in spezifischem Meeting
curl -X GET "http://localhost:3221/search?q=Matratze&meetingId=550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 6. Audio transkribieren (Chrome Extension)

**POST** `/whisper`

**Headers:**
```http
x-api-key: test123
x-chunk-start-time: 2025-07-27T19:34:32.496Z
x-chunk-end-time: 2025-07-27T19:34:52.393Z
x-chunk-duration: 19897
x-chunk-size: 319907
x-audio-type: tab
x-meeting-id: 550e8400-e29b-41d4-a716-446655440000
```

**Request Body:**
```
Multipart form data mit audio file
```

**Response (200):**
```json
{
  "transcript": "Das Wort Matratze kommt aus dem Arabischen und bezeichnet ursprünglich ein Bodenkissen.",
  "meeting_id": "550e8400-e29b-41d4-a716-446655440000",
  "saved_to_db": true
}
```

---

## 🔍 Frontend Integration Beispiele

### JavaScript/Fetch API

```javascript
// Alle Meetings abrufen
async function getMeetings() {
  const response = await fetch('http://localhost:3221/meetings', {
    headers: {
      'x-api-key': 'test123'
    }
  });
  return await response.json();
}

// Meeting mit Transkripten abrufen
async function getMeeting(id) {
  const response = await fetch(`http://localhost:3221/meetings/${id}`, {
    headers: {
      'x-api-key': 'test123'
    }
  });
  return await response.json();
}

// Neues Meeting erstellen
async function createMeeting(title, description) {
  const response = await fetch('http://localhost:3221/meetings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'test123'
    },
    body: JSON.stringify({ title, description })
  });
  return await response.json();
}

// Transkripte durchsuchen
async function searchTranscripts(query, meetingId = null) {
  const url = meetingId 
    ? `http://localhost:3221/search?q=${encodeURIComponent(query)}&meetingId=${meetingId}`
    : `http://localhost:3221/search?q=${encodeURIComponent(query)}`;
    
  const response = await fetch(url, {
    headers: {
      'x-api-key': 'test123'
    }
  });
  return await response.json();
}
```

### React Hook Beispiel

```javascript
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3221';
const API_KEY = 'test123';

const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${API_BASE}/meetings`, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { meetings, loading, error, refetch: fetchMeetings };
};
```

---

## ⚠️ Fehlerbehandlung

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Meeting not found"
}
```

### 400 Bad Request
```json
{
  "error": "Title is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create meeting"
}
```

---

## 📝 Hinweise

1. **Zeitstempel:** Alle Zeitstempel sind im ISO 8601 Format (UTC)
2. **UUIDs:** Alle IDs sind UUID v4 Format
3. **Audio-Typen:** `tab` für Tab-Audio, `microphone` für Mikrofon-Audio
4. **Chunk-Duration:** In Millisekunden
5. **Audio-Size:** In Bytes

---

## 🚀 Quick Start

1. **Server starten:**
   ```bash
   node server.js
   ```

2. **API testen:**
   ```bash
   curl -X GET http://localhost:3221/meetings -H "x-api-key: test123"
   ```

3. **Frontend integrieren:**
   - Verwende die JavaScript-Beispiele oben
   - Ersetze `test123` mit deinem API-Key
   - Passe die Base URL an deine Umgebung an 
# Meeting Assistant API Documentation

## 📋 Overview

The Meeting Assistant API enables the management of meetings and transcriptions. All endpoints require an API key in the header `x-api-key`.

**Base URL:** `http://localhost:3221`  
**API Key:** `test123`

---

## 🔐 Authentication

All API calls require the API key in the header:

```http
x-api-key: test123
```

---

## 📊 Database Schema

### Meetings Table
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transcripts Table
```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id),
  audio_type VARCHAR(50), -- 'tab' or 'microphone'
  transcript TEXT,
  audio_file VARCHAR(255),
  audio_size INTEGER,
  chunk_start_time TIMESTAMP,
  chunk_end_time TIMESTAMP,
  chunk_duration INTEGER, -- in milliseconds
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 API Endpoints

### 1. Create Meeting

**POST** `/meetings`

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly Team Update"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Team Meeting",
  "description": "Weekly Team Update",
  "created_at": "2025-07-27T19:15:00.000Z",
  "updated_at": "2025-07-27T19:15:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3221/meetings \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{"title": "Team Meeting", "description": "Weekly Team Update"}'
```

---

### 2. Get All Meetings

**GET** `/meetings`

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Meeting",
    "description": "Weekly Team Update",
    "created_at": "2025-07-27T19:15:00.000Z",
    "updated_at": "2025-07-27T19:15:00.000Z",
    "transcript_count": "5"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Test Meeting",
    "description": "A test meeting",
    "created_at": "2025-07-27T19:20:00.000Z",
    "updated_at": "2025-07-27T19:20:00.000Z",
    "transcript_count": "0"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3221/meetings \
  -H "x-api-key: test123"
```

---

### 3. Get Specific Meeting with Transcripts

**GET** `/meetings/:id`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Team Meeting",
  "description": "Weekly Team Update",
  "created_at": "2025-07-27T19:15:00.000Z",
  "updated_at": "2025-07-27T19:15:00.000Z",
  "transcripts": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "audio_type": "tab",
      "transcript": "The word mattress comes from Arabic and originally refers to a floor cushion.",
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
      "transcript": "I can still remember my youth, when we mostly had three-part mattresses.",
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

**cURL Example:**
```bash
curl -X GET "http://localhost:3221/meetings/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 4. Delete Meeting

**DELETE** `/meetings/:id`

**Response (200):**
```json
{
  "message": "Meeting deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3221/meetings/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 5. Search Transcripts

**GET** `/search?q=term&meetingId=optional`

**Parameters:**
- `q` (required): Search term
- `meetingId` (optional): Specific meeting for search

**Response (200):**
```json
[
  {
    "meeting_id": "550e8400-e29b-41d4-a716-446655440000",
    "meeting_title": "Team Meeting",
    "transcript_id": "770e8400-e29b-41d4-a716-446655440002",
    "audio_type": "tab",
    "transcript": "The word mattress comes from Arabic and originally refers to a floor cushion.",
    "chunk_start_time": "2025-07-27T19:34:32.496Z",
    "chunk_end_time": "2025-07-27T19:34:52.393Z",
    "created_at": "2025-07-27T19:34:54.244Z"
  }
]
```

**cURL Examples:**
```bash
# Search in all transcripts
curl -X GET "http://localhost:3221/search?q=mattress" \
  -H "x-api-key: test123"

# Search in specific meeting
curl -X GET "http://localhost:3221/search?q=mattress&meetingId=550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: test123"
```

---

### 6. Transcribe Audio (Chrome Extension)

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
Multipart form data with audio file
```

**Response (200):**
```json
{
  "transcript": "The word mattress comes from Arabic and originally refers to a floor cushion.",
  "meeting_id": "550e8400-e29b-41d4-a716-446655440000",
  "saved_to_db": true
}
```

---

## 🔍 Frontend Integration Examples

### JavaScript/Fetch API

```javascript
// Get all meetings
async function getMeetings() {
  const response = await fetch('http://localhost:3221/meetings', {
    headers: {
      'x-api-key': 'test123'
    }
  });
  return await response.json();
}

// Get meeting with transcripts
async function getMeeting(id) {
  const response = await fetch(`http://localhost:3221/meetings/${id}`, {
    headers: {
      'x-api-key': 'test123'
    }
  });
  return await response.json();
}

// Create new meeting
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

// Search transcripts
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

### React Hook Example

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

## ⚠️ Error Handling

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

## 📝 Notes

1. **Timestamps:** All timestamps are in ISO 8601 format (UTC)
2. **UUIDs:** All IDs are UUID v4 format
3. **Audio Types:** `tab` for tab audio, `microphone` for microphone audio
4. **Chunk Duration:** In milliseconds
5. **Audio Size:** In bytes

---

## 🚀 Quick Start

1. **Start server:**
   ```bash
   node server.js
   ```

2. **Test API:**
   ```bash
   curl -X GET http://localhost:3221/meetings -H "x-api-key: test123"
   ```

3. **Integrate frontend:**
   - Use the JavaScript examples above
   - Replace `test123` with your API key
   - Adjust the base URL to your environment 
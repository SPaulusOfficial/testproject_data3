# Notification API Documentation

## Overview

The Notification API provides a RESTful interface for managing notifications in the Salesfive AI Platform. External services can use this API to create, read, update, and delete notifications for users.

**Base URL:** `http://localhost:3002/api`

## Authentication

The API uses JWT (JSON Web Token) authentication for secure access. All endpoints except `/api/auth/login` and `/api/health` require a valid JWT token in the Authorization header.

### Login

**POST** `/api/auth/login`

Authenticate with username and password to receive a JWT token.

#### Request Body

```json
{
  "username": "string",
  "password": "string"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

#### Response

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@salesfive.com",
    "role": "admin",
    "projects": ["project1", "project2"]
  }
}
```

### Using the Token

Include the JWT token in the Authorization header for all subsequent requests:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/notifications/user123
```

### Demo Credentials

- **Admin User:** `admin` / `password` (access to all projects)
- **Regular User:** `user1` / `password` (access to project1 only)

## API Endpoints

### 1. Create Notification

**POST** `/api/notifications`

Creates a new notification for a user.

#### Request Body

```json
{
  "user_id": "string",
  "project_id": "string (optional)",
  "title": "string (max 500 chars)",
  "message": "string",
  "type": "info|success|warning|error|action",
  "priority": "low|medium|high|urgent",
  "metadata": {
    "actionUrl": "string (optional)",
    "actionText": "string (optional)",
    "category": "string (optional)",
    "customField": "any (optional)"
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:3002/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": "user123",
    "project_id": "project456",
    "title": "New Project Update",
    "message": "A new update has been released for your project.",
    "type": "info",
    "priority": "medium",
    "metadata": {
      "actionUrl": "/projects/456",
      "actionText": "View Project",
      "category": "project"
    }
  }'
```

#### Response

```json
{
  "id": 1,
  "user_id": "user123",
  "project_id": "project456",
  "title": "New Project Update",
  "message": "A new update has been released for your project.",
  "type": "info",
  "priority": "medium",
  "metadata": {
    "actionUrl": "/projects/456",
    "actionText": "View Project",
    "category": "project"
  },
  "is_read": false,
  "is_deleted": false,
  "created_at": "2024-01-15T10:30:00Z",
  "read_at": null,
  "deleted_at": null
}
```

### 2. Get User Notifications

**GET** `/api/notifications/{userId}`

Retrieves all notifications for a specific user.

#### Query Parameters

- `projectId` (optional): Filter notifications by project

#### Example Request

```bash
# Get all notifications for user
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/notifications/user123

# Get notifications for specific project
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/notifications/user123?projectId=project456
```

#### Response

```json
[
  {
    "id": 1,
    "user_id": "user123",
    "project_id": "project456",
    "title": "New Project Update",
    "message": "A new update has been released for your project.",
    "type": "info",
    "priority": "medium",
    "metadata": {
      "actionUrl": "/projects/456",
      "actionText": "View Project",
      "category": "project"
    },
    "is_read": false,
    "is_deleted": false,
    "created_at": "2024-01-15T10:30:00Z",
    "read_at": null,
    "deleted_at": null
  }
]
```

### 3. Mark Notification as Read

**PATCH** `/api/notifications/{id}/read`

Marks a specific notification as read or unread.

#### Request Body

```json
{
  "is_read": true
}
```

#### Example Request

```bash
curl -X PATCH http://localhost:3002/api/notifications/1/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"is_read": true}'
```

#### Response

```json
{
  "id": 1,
  "user_id": "user123",
  "project_id": "project456",
  "title": "New Project Update",
  "message": "A new update has been released for your project.",
  "type": "info",
  "priority": "medium",
  "metadata": {
    "actionUrl": "/projects/456",
    "actionText": "View Project",
    "category": "project"
  },
  "is_read": true,
  "is_deleted": false,
  "created_at": "2024-01-15T10:30:00Z",
  "read_at": "2024-01-15T11:00:00Z",
  "deleted_at": null
}
```

### 4. Delete Notification

**DELETE** `/api/notifications/{id}`

Soft deletes a notification (marks as deleted but doesn't remove from database).

#### Example Request

```bash
curl -X DELETE http://localhost:3002/api/notifications/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response

```json
{
  "id": 1,
  "user_id": "user123",
  "project_id": "project456",
  "title": "New Project Update",
  "message": "A new update has been released for your project.",
  "type": "info",
  "priority": "medium",
  "metadata": {
    "actionUrl": "/projects/456",
    "actionText": "View Project",
    "category": "project"
  },
  "is_read": true,
  "is_deleted": true,
  "created_at": "2024-01-15T10:30:00Z",
  "read_at": "2024-01-15T11:00:00Z",
  "deleted_at": "2024-01-15T12:00:00Z"
}
```

### 5. Get Unread Count

**GET** `/api/notifications/{userId}/unread-count`

Returns the count of unread notifications for a user.

#### Example Request

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/notifications/user123/unread-count
```

#### Response

```json
{
  "count": 5
}
```

### 6. Bulk Operations

**PATCH** `/api/notifications/bulk`

Performs bulk operations on multiple notifications.

#### Request Body

```json
{
  "userId": "string",
  "action": "mark-read|mark-unread|delete",
  "notificationIds": [1, 2, 3]
}
```

#### Example Request

```bash
curl -X PATCH http://localhost:3002/api/notifications/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user123",
    "action": "mark-read",
    "notificationIds": [1, 2, 3]
  }'
```

#### Response

```json
{
  "updated": 3
}
```

### 7. Health Check

**GET** `/api/health`

Returns the health status of the API and database connection.

#### Example Request

```bash
curl http://localhost:3002/api/health
```

#### Response

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "Connected"
}
```

## Data Types

### Notification Types

- `info`: General information
- `success`: Success messages
- `warning`: Warning messages
- `error`: Error messages
- `action`: Actionable notifications

### Priority Levels

- `low`: Low priority
- `medium`: Medium priority (default)
- `high`: High priority
- `urgent`: Urgent priority

### Metadata Fields

The `metadata` object can contain any custom fields. Common fields include:

- `actionUrl`: URL to navigate to when notification is clicked
- `actionText`: Text for the action button
- `category`: Category for grouping notifications
- `icon`: Icon identifier
- `color`: Custom color for the notification
- `expiresAt`: Expiration timestamp
- `source`: Source system identifier

## Security Features

### Access Control

- **User Isolation**: Users can only access their own notifications
- **Admin Access**: Admin users can access all notifications
- **Project-based Access**: Users are restricted to their assigned projects
- **Token Expiration**: JWT tokens expire after 24 hours by default

### Authentication Errors

Common authentication error responses:

```json
{
  "error": "Access token required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

```json
{
  "error": "Access denied"
}
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error Response

```json
{
  "error": "Failed to create notification"
}
```

## Integration Examples

### 1. External Service Integration (Node.js)

```javascript
const axios = require('axios');

class NotificationService {
  constructor(baseUrl = 'http://localhost:3002/api') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username,
        password
      });
      this.token = response.data.token;
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async createNotification(notification) {
    try {
      const response = await axios.post(`${this.baseUrl}/notifications`, notification, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserNotifications(userId, projectId = null) {
    try {
      const url = projectId 
        ? `${this.baseUrl}/notifications/${userId}?projectId=${projectId}`
        : `${this.baseUrl}/notifications/${userId}`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error.response?.data || error.message);
      throw error;
    }
  }

  async markAsRead(notificationId, isRead = true) {
    try {
      const response = await axios.patch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        is_read: isRead
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage example
const notificationService = new NotificationService();

// First, login to get a token
await notificationService.login('admin', 'password');

// Then create a notification
await notificationService.createNotification({
  user_id: 'user123',
  project_id: 'project456',
  title: 'System Update',
  message: 'A new system update is available.',
  type: 'info',
  priority: 'medium',
  metadata: {
    actionUrl: '/settings',
    actionText: 'Update Now',
    category: 'system'
  }
});
```

### 2. Python Integration

```python
import requests
import json

class NotificationService:
    def __init__(self, base_url='http://localhost:3002/api'):
        self.base_url = base_url
        self.token = None

    def login(self, username, password):
        try:
            response = requests.post(
                f'{self.base_url}/auth/login',
                json={'username': username, 'password': password},
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            data = response.json()
            self.token = data['token']
            return data
        except requests.exceptions.RequestException as e:
            print(f'Login failed: {e}')
            raise

    def get_auth_headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers

    def create_notification(self, notification):
        try:
            response = requests.post(
                f'{self.base_url}/notifications',
                json=notification,
                headers=self.get_auth_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Failed to create notification: {e}')
            raise

    def get_user_notifications(self, user_id, project_id=None):
        try:
            url = f'{self.base_url}/notifications/{user_id}'
            if project_id:
                url += f'?projectId={project_id}'
            
            response = requests.get(url, headers=self.get_auth_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Failed to get notifications: {e}')
            raise

# Usage example
notification_service = NotificationService()

# First, login to get a token
notification_service.login('admin', 'password')

# Then create a notification
notification = {
    'user_id': 'user123',
    'project_id': 'project456',
    'title': 'Task Completed',
    'message': 'Your task has been completed successfully.',
    'type': 'success',
    'priority': 'medium',
    'metadata': {
        'actionUrl': '/tasks/123',
        'actionText': 'View Task',
        'category': 'task'
    }
}

result = notification_service.create_notification(notification)
print(f'Created notification with ID: {result["id"]}')
```

### 3. Webhook Integration

For real-time notifications, you can implement webhooks:

```javascript
// Webhook endpoint in your external service
app.post('/webhook/notifications', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'notification.created':
      // Handle new notification
      console.log('New notification:', data);
      break;
    case 'notification.read':
      // Handle notification read
      console.log('Notification read:', data);
      break;
    default:
      console.log('Unknown event:', event);
  }
  
  res.status(200).json({ received: true });
});
```

## Best Practices

### 1. Rate Limiting

Implement rate limiting in your external services to avoid overwhelming the API:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/notifications', limiter);
```

### 2. Error Handling

Always implement proper error handling:

```javascript
try {
  const notification = await notificationService.createNotification(data);
  console.log('Notification created:', notification.id);
} catch (error) {
  console.error('Failed to create notification:', error.message);
  // Implement retry logic or fallback
}
```

### 3. Validation

Validate notification data before sending:

```javascript
function validateNotification(notification) {
  const required = ['user_id', 'title', 'message'];
  const missing = required.filter(field => !notification[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (notification.title.length > 500) {
    throw new Error('Title too long (max 500 characters)');
  }
  
  return true;
}
```

### 4. Retry Logic

Implement retry logic for failed requests:

```javascript
async function createNotificationWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await notificationService.createNotification(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Environment Variables

Configure the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL_MODE=disable

# API Configuration
API_PORT=3002
API_TIMEOUT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Notification Settings
NOTIFICATION_POLLING_INTERVAL_MS=10000
NOTIFICATION_FULL_REFRESH_INTERVAL_MS=3600000
NOTIFICATION_RETENTION_DAYS=30
```

## Database Schema

The notifications table structure:

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  metadata JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

## Support

For questions or issues with the API, please contact the development team or create an issue in the project repository.

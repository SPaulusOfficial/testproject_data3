# Profile Update Fix - Dokumentation

## 🐛 **Problem**
Der User konnte seinen Vornamen und Nachnamen in der Profile-Seite nicht ändern. Nach dem Speichern verschwanden die Änderungen wieder.

## 🔍 **Ursache**
1. **Backend-API**: Der PUT `/api/users/:id` Endpunkt verarbeitete die Felder `firstName` und `lastName` nicht
2. **Frontend-Service**: Der `UserService.updateUser()` transformierte die Daten nicht korrekt
3. **Datenformat**: Inkonsistenz zwischen Frontend- und Backend-Datenformat

## ✅ **Behebung**

### **1. Backend-API erweitert**
**Datei:** `BlueDevil/backend/server.js`

**Vorher:**
```javascript
const { username, email, globalRole, customData, metadata } = req.body;

const result = await client.query(`
  UPDATE users 
  SET username = COALESCE($1, username),
      email = COALESCE($2, email),
      global_role = COALESCE($3, global_role),
      custom_data = COALESCE($4, custom_data),
      metadata = COALESCE($5, metadata),
      updated_at = NOW()
  WHERE id = $6
  RETURNING *
`, [username, email, globalRole, customData, metadata, id]);
```

**Nachher:**
```javascript
const { username, email, firstName, lastName, phone, globalRole, customData, metadata } = req.body;

const result = await client.query(`
  UPDATE users 
  SET username = COALESCE($1, username),
      email = COALESCE($2, email),
      first_name = COALESCE($3, first_name),
      last_name = COALESCE($4, last_name),
      phone = COALESCE($5, phone),
      global_role = COALESCE($6, global_role),
      custom_data = COALESCE($7, custom_data),
      metadata = COALESCE($8, metadata),
      updated_at = NOW()
  WHERE id = $9
  RETURNING *
`, [username, email, firstName, lastName, phone, globalRole, customData, metadata, id]);
```

### **2. UserService.transformBackendUser() verbessert**
**Datei:** `BlueDevil/src/services/UserService.ts`

**Vorher:**
```typescript
profile: {
  firstName: backendUser.first_name || '',
  lastName: backendUser.last_name || '',
  // ...
}
```

**Nachher:**
```typescript
profile: {
  firstName: backendUser.firstName || backendUser.first_name || '',
  lastName: backendUser.lastName || backendUser.last_name || '',
  // ...
}
```

### **3. UserService.updateUser() erweitert**
**Datei:** `BlueDevil/src/services/UserService.ts`

**Neue Funktionalität:**
- Transformiert Frontend-Daten in Backend-Format
- Unterstützt sowohl `profile.firstName` als auch direkte `firstName` Felder
- Verwendet `transformBackendUser()` für konsistente Rückgabe

```typescript
async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
  // Transform frontend data to backend format
  const backendData: any = {};
  
  // Handle profile data
  if (updateData.profile) {
    if (updateData.profile.firstName !== undefined) backendData.firstName = updateData.profile.firstName;
    if (updateData.profile.lastName !== undefined) backendData.lastName = updateData.profile.lastName;
    if (updateData.profile.phone !== undefined) backendData.phone = updateData.profile.phone;
  }
  
  // Handle direct firstName/lastName fields (for backward compatibility)
  if (updateData.firstName !== undefined) backendData.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) backendData.lastName = updateData.lastName;
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  const backendUser = await response.json();
  return this.transformBackendUser(backendUser);
}
```

### **4. UserProfilePage.updateData Format angepasst**
**Datei:** `BlueDevil/src/pages/UserProfilePage.tsx`

**Vorher:**
```typescript
const updateData = {
  firstName: formData.firstName,
  lastName: formData.lastName,
  phone: formData.phone,
  email: formData.email,
  username: formData.username
};
```

**Nachher:**
```typescript
const updateData = {
  profile: {
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone
  },
  email: formData.email,
  username: formData.username
};
```

### **5. Form-Data nach Update aktualisieren**
**Datei:** `BlueDevil/src/pages/UserProfilePage.tsx`

Nach erfolgreichem Update werden die Form-Daten mit den neuen Werten aktualisiert:

```typescript
const updatedUser = await userService.updateUser(currentUser.id, updateData);
setCurrentUser(updatedUser);

// Update form data with the new values
const nameParts = updatedUser.profile?.firstName && updatedUser.profile?.lastName 
  ? [updatedUser.profile.firstName, updatedUser.profile.lastName]
  : updatedUser.username?.split(' ') || [];

setFormData({
  firstName: nameParts[0] || '',
  lastName: nameParts.slice(1).join(' ') || '',
  email: updatedUser.email || '',
  phone: updatedUser.profile?.phone || '',
  username: updatedUser.username || ''
});
```

## 🧪 **Tests**

### **Backend-Test**
```bash
# Update User
curl -X PUT http://localhost:3002/api/users/439ca6e3-fdfc-4590-88b7-26761a914af2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"firstName":"Test","lastName":"User","phone":"123456789"}'

# Get User
curl -X GET http://localhost:3002/api/users/439ca6e3-fdfc-4590-88b7-26761a914af2 \
  -H "Authorization: Bearer <token>"
```

### **Frontend-Test**
1. Login mit admin@salesfive.com / admin123
2. Klicke auf User Profile Button im Header
3. Klicke auf "Edit" Button
4. Ändere Vorname und Nachname
5. Klicke auf "Save Changes"
6. Überprüfe, dass die Änderungen gespeichert bleiben

## ✅ **Ergebnis**

- ✅ Vorname und Nachname können jetzt bearbeitet werden
- ✅ Änderungen werden korrekt gespeichert
- ✅ Daten werden nach dem Update korrekt angezeigt
- ✅ Backward-Kompatibilität gewährleistet
- ✅ Konsistente Datenformate zwischen Frontend und Backend

## 🔧 **Technische Details**

### **Datenbank-Schema**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  global_role VARCHAR(50) DEFAULT 'user',
  custom_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **API-Response Format**
```json
{
  "id": "439ca6e3-fdfc-4590-88b7-26761a914af2",
  "username": "admin",
  "email": "admin@salesfive.com",
  "firstName": "Test",
  "lastName": "User",
  "phone": "123456789",
  "globalRole": "admin",
  "customData": {},
  "metadata": {},
  "createdAt": "2025-08-08T17:01:19.712Z",
  "updatedAt": "2025-08-08T20:39:00.941Z"
}
```

### **Frontend User Type**
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  globalRole: string;
  // ... other fields
}
```

## 🎯 **Status: Behoben**

Das Profile-Update-Problem ist vollständig behoben. User können jetzt ihre Vornamen und Nachnamen erfolgreich ändern und die Änderungen bleiben gespeichert.

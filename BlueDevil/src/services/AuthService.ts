const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class AuthService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async login(emailOrUsername: string, password: string) {
    try {
      console.log('🔐 Attempting login with:', { emailOrUsername, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: emailOrUsername, password }),
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login failed:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', { user: data.user?.username, token: data.token ? '***' : 'none' });
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }



  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
}

export default new AuthService();

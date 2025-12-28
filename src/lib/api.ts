// Django API client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  streak_days: number;
  last_activity_date: string | null;
}

// Token management
const getTokens = (): AuthTokens | null => {
  const tokens = localStorage.getItem('auth_tokens');
  return tokens ? JSON.parse(tokens) : null;
};

const setTokens = (tokens: AuthTokens) => {
  localStorage.setItem('auth_tokens', JSON.stringify(tokens));
};

const clearTokens = () => {
  localStorage.removeItem('auth_tokens');
};

// API request helper
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requiresAuth) {
    const tokens = getTokens();
    if (tokens) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.access}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token refresh if needed
  if (response.status === 401 && requiresAuth) {
    const tokens = getTokens();
    if (tokens?.refresh) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (refreshResponse.ok) {
        const newTokens = await refreshResponse.json();
        setTokens({ ...tokens, access: newTokens.access });
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newTokens.access}`;
        return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
      } else {
        clearTokens();
      }
    }
  }

  return response;
};

// Auth API
export const authApi = {
  register: async (email: string, password: string, displayName?: string) => {
    const response = await apiRequest(
      '/auth/register/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      },
      false
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.email?.[0] || error.password?.[0] || 'Registration failed');
    }

    const data = await response.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return { user: data.user, error: null };
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest(
      '/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return { user: data.user, profile: data.profile, error: null };
  },

  logout: () => {
    clearTokens();
  },

  isAuthenticated: () => {
    return !!getTokens();
  },

  getTokens,
};

// Profile API
export const profileApi = {
  get: async (): Promise<Profile> => {
    const response = await apiRequest('/profile/');
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  update: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await apiRequest('/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
};

// Content Generation API
export const contentApi = {
  generate: async (topic: string, mode: string) => {
    const response = await apiRequest('/content/generate/', {
      method: 'POST',
      body: JSON.stringify({ topic, mode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    return response.json();
  },
};

// Activity API
export const activityApi = {
  log: async (activityType: string, topicName: string, pointsEarned: number) => {
    const response = await apiRequest('/activities/log/', {
      method: 'POST',
      body: JSON.stringify({
        activity_type: activityType,
        topic_name: topicName,
        points_earned: pointsEarned,
      }),
    });

    if (!response.ok) throw new Error('Failed to log activity');
    return response.json();
  },

  getAll: async () => {
    const response = await apiRequest('/activities/');
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },
};

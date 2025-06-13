const SERVER_PORT = process.env.SERVER_PORT || 3001;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:${SERVER_PORT}/api`;

export const API_ENDPOINTS = {
    users: `${API_BASE_URL}/users`,
    templates: `${API_BASE_URL}/templates`,
    weddingInvitations: `${API_BASE_URL}/wedding-invitations`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
    register: `${API_BASE_URL}/auth/register`,
    dashboard: `${API_BASE_URL}/dashboard`,
    recommendWeddingSaying: `${API_BASE_URL}/recommend-wedding-saying`,
} as const; 
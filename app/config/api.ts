const API_PORT = process.env.SERVER_PORT || 3001;
export const API_BASE_URL = `http://localhost:${API_PORT}/api`;

export const API_ENDPOINTS = {
    users: `${API_BASE_URL}/users`,
    templates: `${API_BASE_URL}/templates`,
    weddingInvitations: `${API_BASE_URL}/wedding-invitations`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    dashboard: `${API_BASE_URL}/dashboard`,
    // Add other endpoints here as needed
} as const; 
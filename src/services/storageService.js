/**
 * Storage Service
 * Unified Client-Side REST API client communicating exclusively
 * with the local JSON storage server via HTTP fetch().
 * 
 * NO browser localStorage, sessionStorage, or IndexedDB is used.
 */

const API_BASE = '/api';

/**
 * Generic request helper with robust error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`[StorageService] Network error connecting to Local Storage Server at ${url}`);
      throw new Error('Local JSON Storage Server is offline. Please run "npm run storage".');
    }
    throw error;
  }
}

export const storageService = {
  // ==========================================
  // Auth Operations
  // ==========================================
  async register(userData) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async login(credentials) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async getCurrentUser(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await request('/auth/me', {
      method: 'GET',
      headers
    });
  },

  async logout(userId) {
    return await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  // ==========================================
  // User Management
  // ==========================================
  async getUsers() {
    return await request('/users', { method: 'GET' });
  },

  async getUser(id) {
    return await request(`/users/${id}`, { method: 'GET' });
  },

  async createUser(userData) {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, userData) {
    return await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // ==========================================
  // Grievance Operations
  // ==========================================
  async getGrievances(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/grievances${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async getGrievance(id, queryParams = {}) {
    const query = new URLSearchParams(queryParams).toString();
    return await request(`/grievances/${id}${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async createGrievance(grievanceData) {
    return await request('/grievances', {
      method: 'POST',
      body: JSON.stringify(grievanceData)
    });
  },

  async updateGrievance(id, updateData) {
    return await request(`/grievances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  async updateGrievanceStatus(id, statusData) {
    return await request(`/grievances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
  },

  // ==========================================
  // Notification Operations
  // ==========================================
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/notifications${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async createNotification(notificationData) {
    return await request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  },

  async updateNotification(id, data) {
    return await request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async markNotificationRead(id) {
    return await request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead(userId) {
    return await request('/notifications/mark-all-read', {
      method: 'PATCH',
      body: JSON.stringify({ userId })
    });
  },

  // ==========================================
  // Feedback Operations
  // ==========================================
  async getFeedback(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/feedback${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async createFeedback(feedbackData) {
    return await request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  },

  // ==========================================
  // Activity Log Operations
  // ==========================================
  async getActivityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/activity-logs${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async createActivityLog(activityData) {
    return await request('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  },

  // ==========================================
  // Lookup / Master Entities
  // ==========================================
  async getDepartments() {
    return await request('/departments', { method: 'GET' });
  },

  async createDepartment(deptData) {
    return await request('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
  },

  async updateDepartment(id, deptData) {
    return await request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deptData)
    });
  },

  async getOfficers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/officers${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async createOfficer(officerData) {
    return await request('/officers', {
      method: 'POST',
      body: JSON.stringify(officerData)
    });
  },

  async updateOfficer(id, officerData) {
    return await request(`/officers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(officerData)
    });
  },

  async getTracking(grievanceId) {
    return await request(`/tracking?grievanceId=${grievanceId}`, { method: 'GET' });
  },

  async addTracking(trackingData) {
    return await request('/tracking', {
      method: 'POST',
      body: JSON.stringify(trackingData)
    });
  }
};

export default storageService;

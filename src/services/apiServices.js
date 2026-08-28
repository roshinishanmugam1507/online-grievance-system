import storageService from './storageService';

export const departmentApi = {
  getAll: async () => {
    return await storageService.getDepartments();
  },

  create: async (deptData) => {
    return await storageService.createDepartment(deptData);
  },

  update: async (id, deptData) => {
    return await storageService.updateDepartment(id, deptData);
  }
};

export const officerApi = {
  getAll: async (params = {}) => {
    return await storageService.getOfficers(params);
  },

  create: async (officerData) => {
    return await storageService.createOfficer(officerData);
  },

  update: async (id, officerData) => {
    return await storageService.updateOfficer(id, officerData);
  }
};

export const notificationApi = {
  getAll: async (params = {}) => {
    return await storageService.getNotifications(params);
  },

  markAsRead: async (id) => {
    return await storageService.markNotificationRead(id);
  },

  markAllAsRead: async (userId) => {
    return await storageService.markAllNotificationsRead(userId);
  },

  create: async (notifData) => {
    return await storageService.createNotification(notifData);
  }
};

export const feedbackApi = {
  getAll: async (params = {}) => {
    return await storageService.getFeedback(params);
  },

  create: async (feedbackData) => {
    return await storageService.createFeedback(feedbackData);
  }
};

export const userApi = {
  getAll: async () => {
    return await storageService.getUsers();
  },

  getById: async (id) => {
    return await storageService.getUser(id);
  },

  create: async (userData) => {
    return await storageService.createUser(userData);
  },

  update: async (id, userData) => {
    return await storageService.updateUser(id, userData);
  }
};

export const activityApi = {
  getAll: async (params = {}) => {
    return await storageService.getActivityLogs(params);
  },

  create: async (activityData) => {
    return await storageService.createActivityLog(activityData);
  }
};

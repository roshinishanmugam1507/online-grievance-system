import storageService from './storageService';

export const grievanceApi = {
  getAll: async (params = {}) => {
    return await storageService.getGrievances(params);
  },

  getById: async (id, queryParams = {}) => {
    return await storageService.getGrievance(id, queryParams);
  },

  create: async (grievanceData) => {
    return await storageService.createGrievance(grievanceData);
  },

  update: async (id, updateData) => {
    return await storageService.updateGrievance(id, updateData);
  },

  updateStatus: async (id, statusData) => {
    return await storageService.updateGrievanceStatus(id, statusData);
  },

  // Tracking API
  getTracking: async (grievanceId) => {
    return await storageService.getTracking(grievanceId);
  },

  addTracking: async (trackingData) => {
    return await storageService.addTracking(trackingData);
  }
};

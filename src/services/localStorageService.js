/**
 * DEPRECATION NOTICE:
 * All browser localStorage mechanisms have been replaced with the local JSON file storage server.
 * This file is retained as a compatibility shim re-exporting storageService.
 */
import storageService from './storageService';

export const STORAGE_KEYS = {
  USERS: 'users',
  GRIEVANCES: 'grievances',
  DEPARTMENTS: 'departments',
  OFFICERS: 'officers',
  NOTIFICATIONS: 'notifications',
  TRACKING: 'tracking',
  FEEDBACK: 'feedback',
  ACTIVITY_LOGS: 'activity_logs'
};

export const initializeDatabase = () => {
  // Database initialization is now handled physically on disk by server/storage-server.js
  console.log('[OPGRS] Storage connected to physical JSON storage server at http://localhost:5000');
};

export const getItem = () => null;
export const setItem = () => true;
export const removeItem = () => true;
export const resetDatabaseToDefaults = () => {};

export default storageService;

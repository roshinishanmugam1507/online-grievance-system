/**
 * Mock API has been replaced by the local JSON file storage server.
 * All HTTP API calls now communicate directly with server/storage-server.js.
 */
import storageService from './storageService';

export const mockFetch = async () => {
  throw new Error('mockApi is deprecated. Use storageService or standard API endpoints.');
};

export default storageService;

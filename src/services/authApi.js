import storageService from './storageService';

// Active in-memory session token (no localStorage / sessionStorage / IndexedDB)
let activeAuthSession = null;

export const authApi = {
  login: async (credentials) => {
    const session = await storageService.login(credentials);
    activeAuthSession = session;
    return session;
  },

  register: async (userData) => {
    const session = await storageService.register(userData);
    activeAuthSession = session;
    return session;
  },

  getCurrentUser: async () => {
    if (!activeAuthSession?.token) {
      // In-memory session check
      return null;
    }
    const session = await storageService.getCurrentUser(activeAuthSession.token);
    activeAuthSession = session;
    return session;
  },

  logout: async () => {
    const userId = activeAuthSession?.user?.id;
    activeAuthSession = null;
    return await storageService.logout(userId);
  }
};

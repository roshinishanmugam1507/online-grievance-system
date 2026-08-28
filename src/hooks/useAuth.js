import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  loginUser,
  registerUser,
  logoutUser
} from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const login = (credentials) => dispatch(loginUser(credentials));
  const register = (userData) => dispatch(registerUser(userData));
  const logout = () => dispatch(logoutUser());

  const isCitizen = user?.role === 'citizen';
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';

  return {
    user,
    isAuthenticated,
    status,
    error,
    login,
    register,
    logout,
    isCitizen,
    isAdmin,
    isOfficer,
    role: user?.role
  };
};

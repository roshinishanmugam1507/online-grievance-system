import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadCurrentUser } from './features/auth/authSlice';
import { fetchDepartments } from './features/departments/departmentSlice';
import { fetchOfficers } from './features/officers/officerSlice';
import { fetchGrievances } from './features/grievances/grievanceSlice';
import AppRoutes from './routes/AppRoutes';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate session and global lookups from local JSON storage server
    dispatch(loadCurrentUser());
    dispatch(fetchDepartments());
    dispatch(fetchOfficers());
    dispatch(fetchGrievances());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './RouteGuards';
import { PublicLayout, AuthLayout } from '../layouts/PublicAuthLayouts';
import DashboardLayout from '../layouts/DashboardLayouts';

// Pages
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';

import CitizenDashboard from '../pages/CitizenDashboard/CitizenDashboard';
import SubmitGrievancePage from '../pages/SubmitGrievance/SubmitGrievancePage';
import MyGrievancesPage from '../pages/MyGrievances/MyGrievancesPage';
import TrackGrievancePage from '../pages/TrackGrievance/TrackGrievancePage';
import GrievanceDetailsPage from '../pages/GrievanceDetails/GrievanceDetailsPage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import ProfilePage from '../pages/Profile/ProfilePage';

import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import AdminGrievancesPage from '../pages/AdminGrievances/AdminGrievancesPage';
import DepartmentsPage from '../pages/Departments/DepartmentsPage';
import OfficersPage from '../pages/Officers/OfficersPage';
import UsersPage from '../pages/Users/UsersPage';
import FeedbackPage from '../pages/Feedback/FeedbackPage';
import ReportsPage from '../pages/Reports/ReportsPage';

import OfficerDashboard from '../pages/OfficerDashboard/OfficerDashboard';
import OfficerGrievancesPage from '../pages/OfficerGrievances/OfficerGrievancesPage';

import { UnauthorizedPage, NotFoundPage } from '../pages/ErrorPages';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/track" element={<TrackGrievancePage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Citizen Specific Routes */}
        <Route
          path="/citizen/dashboard"
          element={
            <RoleRoute allowedRoles={['citizen']}>
              <CitizenDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/grievances"
          element={
            <RoleRoute allowedRoles={['citizen']}>
              <MyGrievancesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/grievances/new"
          element={
            <RoleRoute allowedRoles={['citizen']}>
              <SubmitGrievancePage />
            </RoleRoute>
          }
        />

        {/* Admin Specific Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/grievances"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminGrievancesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/grievances/:id"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <GrievanceDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <DepartmentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/officers"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <OfficersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <FeedbackPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <ReportsPage />
            </RoleRoute>
          }
        />

        {/* Officer Specific Routes */}
        <Route
          path="/officer/dashboard"
          element={
            <RoleRoute allowedRoles={['officer']}>
              <OfficerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/officer/grievances"
          element={
            <RoleRoute allowedRoles={['officer']}>
              <OfficerGrievancesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/officer/grievances/:id"
          element={
            <RoleRoute allowedRoles={['officer']}>
              <GrievanceDetailsPage />
            </RoleRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route path="/grievances/:id" element={<GrievanceDetailsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Error & Fallback Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopNavbar from '../components/common/TopNavbar';
import ToastContainer from '../components/common/ToastContainer';

export const DashboardLayout = () => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="page-content-wrapper">
          <Outlet />
        </main>
        <footer className="py-3 px-4 bg-white border-top text-center text-muted small mt-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <div>
              © 2026 Online Public Grievance Redressal System (OPGRS). Frontend Demonstration Portal.
            </div>
            <div className="d-flex gap-3">
              <span className="text-secondary"><i className="bi bi-shield-check text-success me-1"></i> SSL 256-Bit Emulated</span>
              <span className="text-secondary"><i className="bi bi-cpu text-info me-1"></i> React + Redux Thunk + Vite</span>
            </div>
          </div>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
};

export const CitizenLayout = () => <DashboardLayout />;
export const AdminLayout = () => <DashboardLayout />;
export const OfficerLayout = () => <DashboardLayout />;

export default DashboardLayout;

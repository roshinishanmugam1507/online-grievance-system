import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ToastContainer from '../components/common/ToastContainer';

export const PublicLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Gov Tricolor bar */}
      <div className="bg-gov-tricolor-strip"></div>

      {/* Public Header */}
      <header className="bg-gov-primary text-white py-2 px-3 px-md-5 border-bottom shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-white rounded-circle d-flex align-items-center justify-content-center text-gov-primary shadow-sm"
              style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}
            >
              <i className="bi bi-shield-shaded"></i>
            </div>
            <div>
              <h1 className="h5 fw-bold text-white mb-0">Online Public Grievance Redressal System</h1>
              <p className="small text-white-50 mb-0">Citizen First Redressal Initiative</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/track" className="btn btn-outline-light btn-sm">
              <i className="bi bi-search me-1"></i> Track Complaint
            </Link>
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="btn btn-accent btn-sm">
                <i className="bi bi-speedometer2 me-1"></i> My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-light btn-sm text-gov-primary fw-semibold">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-accent btn-sm">
                  <i className="bi bi-person-plus me-1"></i> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-gov-primary text-white-50 py-4 mt-auto border-top">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h5 className="text-white fw-bold mb-2">OPGRS Portal</h5>
              <p className="small mb-2">
                A centralized, transparent, and prompt grievance resolution mechanism empowering citizens to report public issues and monitor redressal actions in real-time.
              </p>
              <div className="small text-white-50">
                Helpline: <strong>1800-425-1000</strong> (Toll Free) • grievance-support@gov.demo
              </div>
            </div>
            <div className="col-md-3">
              <h6 className="text-white fw-semibold mb-2">Quick Portals</h6>
              <ul className="list-unstyled small">
                <li className="mb-1"><Link to="/login" className="text-white-50 text-decoration-none">Officer Desk</Link></li>
                <li className="mb-1"><Link to="/login" className="text-white-50 text-decoration-none">Admin Login</Link></li>
                <li className="mb-1"><Link to="/track" className="text-white-50 text-decoration-none">Public Complaint Tracker</Link></li>
                <li className="mb-1"><Link to="/register" className="text-white-50 text-decoration-none">New Citizen Registration</Link></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6 className="text-white fw-semibold mb-2">Technical Standards</h6>
              <div className="small text-white-50">
                Frontend Architecture: React Vite + Redux Toolkit + Bootstrap 5 + LocalStorage REST simulation.
              </div>
            </div>
          </div>
          <hr className="border-secondary my-3" />
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-white-50">
            <div>© 2026 Online Public Grievance Redressal System (OPGRS). All rights reserved.</div>
            <div>Academic Project Demonstration</div>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="bg-gov-tricolor-strip"></div>
      <div className="container my-auto py-5">
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2">
            <div className="bg-gov-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-shield-lock-fill fs-5"></i>
            </div>
            <div className="text-start">
              <div className="h5 fw-bold text-gov-primary mb-0">OPGRS Portal</div>
              <div className="small text-muted">Public Grievance Redressal</div>
            </div>
          </Link>
        </div>
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
};

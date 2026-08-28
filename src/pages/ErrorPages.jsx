import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const getHomeLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="card shadow-lg border-0 rounded-4 text-center p-5 max-w-lg" style={{ maxWidth: '500px' }}>
        <div className="rounded-circle bg-danger bg-opacity-10 text-danger mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
          <i className="bi bi-shield-x fs-1"></i>
        </div>
        <h3 className="fw-bold text-dark mb-2">Access Restricted (403)</h3>
        <p className="text-secondary small mb-4">
          You do not have the required administrative or departmental clearance to view this module. Your current role is <strong>{user?.role?.toUpperCase() || 'GUEST'}</strong>.
        </p>

        <div className="d-grid gap-2">
          <Link to={getHomeLink()} className="btn btn-primary py-2 fw-semibold">
            <i className="bi bi-house-door me-1"></i> Return to Authorized Dashboard
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary py-2"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-1"></i> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="card shadow-lg border-0 rounded-4 text-center p-5 max-w-lg" style={{ maxWidth: '500px' }}>
        <div className="rounded-circle bg-warning bg-opacity-10 text-warning mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
          <i className="bi bi-compass fs-1"></i>
        </div>
        <h3 className="fw-bold text-dark mb-2">Page Not Found (404)</h3>
        <p className="text-secondary small mb-4">
          The requested page or grievance document does not exist or has been relocated.
        </p>

        <div className="d-grid gap-2">
          <Link to="/" className="btn btn-primary py-2 fw-semibold">
            <i className="bi bi-house me-1"></i> Portal Homepage
          </Link>
          <Link to="/track" className="btn btn-outline-primary py-2">
            <i className="bi bi-search me-1"></i> Track a Grievance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../features/tracking/trackingAndMiscSlices';
import { loginUser, logoutUser } from '../../features/auth/authSlice';
import NotificationBell from './NotificationBell';

export const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleQuickSwitchRole = async (targetRole) => {
    let credentials = null;
    if (targetRole === 'admin') {
      credentials = { email: 'admin@grievance.gov.demo', password: 'admin123' };
    } else if (targetRole === 'officer') {
      credentials = { email: 'officer@grievance.gov.demo', password: 'officer123' };
    } else if (targetRole === 'citizen') {
      credentials = { email: 'citizen@example.com', password: 'citizen123' };
    }

    if (credentials) {
      await dispatch(loginUser(credentials));
      if (targetRole === 'admin') navigate('/admin/dashboard');
      else if (targetRole === 'officer') navigate('/officer/dashboard');
      else navigate('/citizen/dashboard');
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      {/* Left side: Sidebar Toggle & Portal Title */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 rounded border"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle Sidebar Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-none d-sm-block">
          <span className="badge bg-light text-gov-primary border me-2 px-2 py-1">
            <i className="bi bi-shield-check me-1"></i> OPGRS Portal
          </span>
          <span className="text-muted small">Public Grievance Redressal</span>
        </div>
      </div>

      {/* Right side: Quick Demo Switcher, Notification Bell & User Menu */}
      <div className="d-flex align-items-center gap-3">
        {/* Academic Demo Switcher */}
        <div className="dropdown d-none d-md-block">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="demoRoleDropdown"
          >
            <i className="bi bi-person-lines-fill text-warning"></i>
            <span>Demo Switch ({user?.role?.toUpperCase()})</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="demoRoleDropdown">
            <li><h6 className="dropdown-header">Switch Demo Account</h6></li>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center gap-2 ${user?.role === 'citizen' ? 'active' : ''}`}
                onClick={() => handleQuickSwitchRole('citizen')}
              >
                <i className="bi bi-person-fill"></i>
                <div>
                  <div className="fw-semibold">Citizen Demo</div>
                  <div className="small text-muted">citizen@example.com</div>
                </div>
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center gap-2 ${user?.role === 'admin' ? 'active' : ''}`}
                onClick={() => handleQuickSwitchRole('admin')}
              >
                <i className="bi bi-shield-lock-fill"></i>
                <div>
                  <div className="fw-semibold">Admin Demo</div>
                  <div className="small text-muted">admin@grievance.gov.demo</div>
                </div>
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center gap-2 ${user?.role === 'officer' ? 'active' : ''}`}
                onClick={() => handleQuickSwitchRole('officer')}
              >
                <i className="bi bi-briefcase-fill"></i>
                <div>
                  <div className="fw-semibold">Officer Demo</div>
                  <div className="small text-muted">officer@grievance.gov.demo</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile Avatar / Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light d-flex align-items-center gap-2 p-1 pe-3 rounded-pill border"
            type="button"
            id="userNavMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-gov-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-start d-none d-sm-block">
              <div className="fw-semibold small text-dark lh-1">{user?.name?.split(' ')[0] || 'User'}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                {user?.role || 'Guest'}
              </div>
            </div>
            <i className="bi bi-chevron-down text-muted small ms-1"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userNavMenu">
            <li className="px-3 py-2 border-bottom">
              <div className="fw-bold text-dark">{user?.name}</div>
              <div className="small text-muted">{user?.email}</div>
              <span className="badge bg-secondary mt-1">{user?.role?.toUpperCase()}</span>
            </li>
            <li>
              <Link className="dropdown-item py-2" to="/profile">
                <i className="bi bi-person me-2 text-primary"></i> My Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item py-2" to="/notifications">
                <i className="bi bi-bell me-2 text-info"></i> Notifications
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;

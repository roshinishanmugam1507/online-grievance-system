import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { setSidebarOpen } from '../../features/tracking/trackingAndMiscSlices';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const closeSidebarMobile = () => {
    if (window.innerWidth < 992) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={() => dispatch(setSidebarOpen(false))}
        ></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <div className="sidebar-brand-title">OPGRS Portal</div>
            <div className="sidebar-brand-subtitle">Public Grievance Redressal</div>
          </div>
        </div>

        {/* Tricolor decorative indicator strip */}
        <div className="bg-gov-tricolor-strip"></div>

        {/* Navigation Menu Links */}
        <ul className="sidebar-menu">
          {/* CITIZEN MENU */}
          {user?.role === 'citizen' && (
            <>
              <li className="sidebar-section-title">Citizen Services</li>
              <li>
                <NavLink
                  to="/citizen/dashboard"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-speedometer2"></i>
                  <span>Citizen Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/grievances/new"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-plus-circle-fill text-warning"></i>
                  <span>Submit Grievance</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/grievances"
                  end
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-card-checklist"></i>
                  <span>My Grievances</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/track"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-search"></i>
                  <span>Track Complaint</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ADMIN MENU */}
          {user?.role === 'admin' && (
            <>
              <li className="sidebar-section-title">Administration</li>
              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-speedometer2"></i>
                  <span>Admin Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/grievances"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-inbox-fill"></i>
                  <span>Grievance Master</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/departments"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-building"></i>
                  <span>Departments</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/officers"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-person-badge"></i>
                  <span>Officer Directory</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-people"></i>
                  <span>Citizen Users</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/feedback"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-star-fill text-warning"></i>
                  <span>Citizen Feedback</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-bar-chart-line-fill"></i>
                  <span>Analytics & Reports</span>
                </NavLink>
              </li>
            </>
          )}

          {/* OFFICER MENU */}
          {user?.role === 'officer' && (
            <>
              <li className="sidebar-section-title">Officer Desk</li>
              <li>
                <NavLink
                  to="/officer/dashboard"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-speedometer2"></i>
                  <span>Officer Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/officer/grievances"
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebarMobile}
                >
                  <i className="bi bi-briefcase-fill"></i>
                  <span>Assigned Cases</span>
                </NavLink>
              </li>
            </>
          )}

          {/* SHARED SECTION */}
          <li className="sidebar-section-title">Account & Support</li>
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebarMobile}
            >
              <i className="bi bi-bell"></i>
              <span>Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebarMobile}
            >
              <i className="bi bi-person-circle"></i>
              <span>My Profile</span>
            </NavLink>
          </li>
        </ul>

        {/* Sidebar Footer with User Details & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card mb-2">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="user-meta-name">{user?.name || 'User'}</div>
              <div className="user-meta-role">{user?.role || 'Guest'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

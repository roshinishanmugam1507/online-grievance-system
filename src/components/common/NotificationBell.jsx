import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllNotifications,
  selectUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} from '../../features/notifications/notificationSlice';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationBell = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector(selectAllNotifications);
  const userNotifs = user?.id ? notifications.filter((n) => !n.userId || n.userId === user.id) : notifications;
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleNotificationClick = (n) => {
    if (!n.read) {
      dispatch(markNotificationRead(n.id));
    }
    setDropdownOpen(false);
    if (n.grievanceId) {
      if (user?.role === 'admin') {
        navigate(`/admin/grievances/${n.grievanceId}`);
      } else if (user?.role === 'officer') {
        navigate(`/officer/grievances/${n.grievanceId}`);
      } else {
        navigate(`/grievances/${n.grievanceId}`);
      }
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead(user?.id));
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-light rounded-circle position-relative p-2 d-flex align-items-center justify-content-center"
        style={{ width: '42px', height: '42px', border: '1px solid #e2e8f0' }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Notifications"
      >
        <i className="bi bi-bell fs-5 text-secondary"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {dropdownOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1025 }}
            onClick={() => setDropdownOpen(false)}
          ></div>
          <div
            className="position-absolute end-0 mt-2 card shadow-lg border-0"
            style={{ width: '360px', zIndex: 1030, maxHeight: '480px', overflow: 'hidden' }}
          >
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 px-3">
              <span className="fw-bold small text-gov-primary">
                Notifications ({unreadCount} new)
              </span>
              {unreadCount > 0 && (
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted small"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '350px' }}>
              {userNotifs.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  <i className="bi bi-bell-slash fs-3 d-block mb-2 text-secondary"></i>
                  No notifications yet.
                </div>
              ) : (
                userNotifs.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    className={`list-group-item list-group-item-action text-start p-3 border-bottom ${
                      !n.read ? 'bg-light fw-medium' : ''
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                      <strong className="text-dark small">{n.title}</strong>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {formatRelativeTime(n.createdAt)}
                      </small>
                    </div>
                    <p className="mb-0 text-secondary small" style={{ fontSize: '0.8rem' }}>
                      {n.message}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="card-footer bg-white text-center py-2">
              <button
                className="btn btn-sm btn-link text-gov-primary text-decoration-none fw-semibold small"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

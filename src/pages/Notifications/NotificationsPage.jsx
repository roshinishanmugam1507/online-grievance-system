import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../features/notifications/notificationSlice';
import { PageHeader, EmptyState } from '../../components/common/CommonComponents';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector(selectAllNotifications);

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const userNotifs = notifications.filter((n) => !n.userId || n.userId === user?.id);
  const displayedNotifs = filter === 'unread' ? userNotifs.filter((n) => !n.read) : userNotifs;
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleItemClick = (n) => {
    if (!n.read) {
      dispatch(markNotificationRead(n.id));
    }
    if (n.grievanceId) {
      if (user?.role === 'admin') {
        navigate(`/admin/grievances/${n.grievanceId}`);
      } else if (user?.role === 'officer') {
        navigate(`/officer/grievances/${n.grievanceId}`);
      } else {
        navigate(`/grievances/${n.grievanceId}`);
      }
    }
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsRead(user?.id));
  };

  return (
    <div>
      <PageHeader
        title="Notification Center"
        subtitle="Stay notified on every assignment, status change, and resolution update regarding your complaints."
        action={
          unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-primary" onClick={handleMarkAll}>
              <i className="bi bi-check-all me-1"></i> Mark All as Read ({unreadCount})
            </button>
          )
        }
      />

      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All ({userNotifs.length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {displayedNotifs.length === 0 ? (
            <EmptyState
              icon="bi-bell-slash"
              title="No Notifications"
              description={filter === 'unread' ? "You have no unread notifications." : "You have not received any notifications yet."}
            />
          ) : (
            <div className="list-group list-group-flush">
              {displayedNotifs.map((n) => (
                <div
                  key={n.id}
                  className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 border-bottom ${
                    !n.read ? 'bg-light fw-medium' : ''
                  }`}
                  onClick={() => handleItemClick(n)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center p-2 mt-1 ${
                      n.type === 'success'
                        ? 'bg-success bg-opacity-10 text-success'
                        : n.type === 'warning'
                        ? 'bg-warning bg-opacity-10 text-warning'
                        : 'bg-primary bg-opacity-10 text-primary'
                    }`}
                    style={{ width: '40px', height: '40px', flexShrink: 0 }}
                  >
                    <i
                      className={`bi ${
                        n.type === 'success'
                          ? 'bi-check-circle-fill'
                          : n.type === 'warning'
                          ? 'bi-exclamation-circle-fill'
                          : 'bi-info-circle-fill'
                      }`}
                    ></i>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold mb-0 text-dark small">{n.title}</h6>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-secondary small mb-1">{n.message}</p>
                    {n.grievanceId && (
                      <span className="badge bg-light text-primary border small">
                        <i className="bi bi-link-45deg me-1"></i> Click to open related grievance
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <span className="badge bg-primary rounded-pill p-1 ms-auto align-self-center" title="Unread">
                      <span className="visually-hidden">unread</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

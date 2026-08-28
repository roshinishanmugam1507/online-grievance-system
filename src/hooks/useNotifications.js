import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectAllNotifications,
  selectUnreadCount
} from '../features/notifications/notificationSlice';

export const useNotifications = (userId = null) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    dispatch(fetchNotifications(userId ? { userId } : {}));
  }, [dispatch, userId]);

  return {
    notifications,
    unreadCount,
    markAsRead: (id) => dispatch(markNotificationRead(id)),
    markAllAsRead: () => dispatch(markAllNotificationsRead(userId)),
    refresh: () => dispatch(fetchNotifications(userId ? { userId } : {}))
  };
};

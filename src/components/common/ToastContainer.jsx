import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../features/tracking/trackingAndMiscSlices';

export const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toasts[0].id));
      }, toasts[0].duration || 3500);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1090 }}
    >
      {toasts.map((t) => {
        let bgClass = 'bg-primary text-white';
        let icon = 'bi-info-circle-fill';
        if (t.type === 'success') {
          bgClass = 'bg-success text-white';
          icon = 'bi-check-circle-fill';
        } else if (t.type === 'danger' || t.type === 'error') {
          bgClass = 'bg-danger text-white';
          icon = 'bi-exclamation-triangle-fill';
        } else if (t.type === 'warning') {
          bgClass = 'bg-warning text-dark';
          icon = 'bi-exclamation-circle-fill';
        }

        return (
          <div
            key={t.id}
            className={`toast show mb-2 shadow-lg border-0 ${bgClass}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex align-items-center justify-content-between p-3">
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${icon} fs-5`}></i>
                <div>
                  <strong className="d-block">{t.title}</strong>
                  <span className="small">{t.message}</span>
                </div>
              </div>
              <button
                type="button"
                className={`btn-close ${t.type === 'warning' ? '' : 'btn-close-white'} ms-2`}
                aria-label="Close"
                onClick={() => dispatch(removeToast(t.id))}
              ></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

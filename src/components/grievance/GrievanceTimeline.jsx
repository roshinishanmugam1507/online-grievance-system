import React from 'react';
import { formatDateTime, getStatusIcon } from '../../utils/formatters';

export const GrievanceTimeline = ({ trackingEvents = [], currentStatus }) => {
  if (!trackingEvents || trackingEvents.length === 0) {
    return (
      <div className="p-3 text-center text-muted small bg-light rounded">
        <i className="bi bi-clock-history me-1"></i> No tracking history recorded yet.
      </div>
    );
  }

  return (
    <div className="timeline-container my-3">
      {trackingEvents.map((evt, index) => {
        const isLatest = index === trackingEvents.length - 1;
        let stepStatusClass = 'completed';
        if (evt.status === 'Rejected') stepStatusClass = 'urgent';
        else if (evt.status === 'Withdrawn') stepStatusClass = '';
        else if (isLatest) stepStatusClass = 'active';

        return (
          <div key={evt.id || index} className={`timeline-step ${stepStatusClass}`}>
            <div className="timeline-icon">
              <i className={`bi ${getStatusIcon(evt.status)}`} style={{ fontSize: '0.65rem' }}></i>
            </div>
            <div className="card border-0 bg-light p-3 shadow-none">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-1">
                <span className="fw-bold text-dark fs-6">{evt.status}</span>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-clock me-1"></i>
                  {formatDateTime(evt.timestamp)}
                </span>
              </div>
              <p className="text-secondary small mb-2">{evt.message}</p>
              <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-person-fill text-gov-primary"></i>
                <span>Updated by: <strong>{evt.updatedBy || 'System'}</strong> ({evt.updatedByRole || 'Admin'})</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GrievanceTimeline;

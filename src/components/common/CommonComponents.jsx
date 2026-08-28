import React from 'react';

export const LoadingSpinner = ({ message = 'Loading data, please wait...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 my-3 text-center">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium mb-0">{message}</p>
    </div>
  );
};

export const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionButton = null
}) => {
  return (
    <div className="card text-center p-5 border-dashed my-3">
      <div className="d-flex justify-content-center mb-3">
        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
          <i className={`bi ${icon} text-muted`} style={{ fontSize: '2rem' }}></i>
        </div>
      </div>
      <h5 className="text-dark fw-bold mb-2">{title}</h5>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '450px' }}>
        {description}
      </p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  icon,
  bgColor = '#eff6ff',
  iconColor = '#1e40af',
  trend = null,
  subtitle = null,
  onClick = null
}) => {
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon-wrapper" style={{ backgroundColor: bgColor, color: iconColor }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="flex-grow-1">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
            <i className={`bi ${trend.isPositive ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`}></i>
            {trend.text}
          </div>
        )}
      </div>
    </div>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  badge = null,
  action = null
}) => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 mb-4 border-bottom">
      <div>
        <div className="d-flex align-items-center gap-2">
          <h2 className="h4 fw-bold text-gov-primary mb-0">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-muted mb-0 small mt-1">{subtitle}</p>}
      </div>
      {action && <div className="mt-3 mt-md-0 d-flex gap-2">{action}</div>}
    </div>
  );
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = null
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 border-top mt-3 gap-2">
      {totalItems !== null && (
        <span className="text-muted small">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total records)
        </span>
      )}
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            <i className="bi bi-chevron-left me-1"></i> Prev
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first, last, and window around current
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(page)}>
                  {page}
                </button>
              </li>
            );
          }
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <li key={page} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          return null;
        })}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default PageHeader;

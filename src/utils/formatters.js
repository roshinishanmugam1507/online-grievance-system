export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'N/A';
  }
};

export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return formatDate(isoString);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return 'N/A';
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Submitted':
      return 'badge-status badge-submitted';
    case 'Under Review':
      return 'badge-status badge-under-review';
    case 'Assigned':
      return 'badge-status badge-assigned';
    case 'In Progress':
      return 'badge-status badge-in-progress';
    case 'Resolved':
      return 'badge-status badge-resolved';
    case 'Rejected':
      return 'badge-status badge-rejected';
    case 'Withdrawn':
      return 'badge-status badge-withdrawn';
    default:
      return 'badge-status badge-submitted';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'Submitted':
      return 'bi-file-earmark-text';
    case 'Under Review':
      return 'bi-search';
    case 'Assigned':
      return 'bi-person-check';
    case 'In Progress':
      return 'bi-gear-wide-connected';
    case 'Resolved':
      return 'bi-check-circle-fill';
    case 'Rejected':
      return 'bi-x-circle-fill';
    case 'Withdrawn':
      return 'bi-dash-circle';
    default:
      return 'bi-info-circle';
  }
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'Low':
      return 'badge-priority priority-low';
    case 'Medium':
      return 'badge-priority priority-medium';
    case 'High':
      return 'badge-priority priority-high';
    case 'Urgent':
      return 'badge-priority priority-urgent';
    default:
      return 'badge-priority priority-medium';
  }
};

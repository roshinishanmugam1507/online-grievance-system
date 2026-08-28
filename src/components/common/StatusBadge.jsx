import React from 'react';
import { getStatusBadgeClass, getStatusIcon } from '../../utils/formatters';

export const StatusBadge = ({ status }) => {
  return (
    <span className={getStatusBadgeClass(status)}>
      <i className={`bi ${getStatusIcon(status)}`}></i>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

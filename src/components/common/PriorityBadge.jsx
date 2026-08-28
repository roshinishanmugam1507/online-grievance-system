import React from 'react';
import { getPriorityBadgeClass } from '../../utils/formatters';

export const PriorityBadge = ({ priority }) => {
  return (
    <span className={getPriorityBadgeClass(priority)}>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;

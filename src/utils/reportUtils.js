export const calculateGrievanceMetrics = (grievances = [], departments = [], officers = [], feedbacks = []) => {
  const total = grievances.length;
  const submitted = grievances.filter(g => g.status === 'Submitted').length;
  const underReview = grievances.filter(g => g.status === 'Under Review').length;
  const assigned = grievances.filter(g => g.status === 'Assigned').length;
  const inProgress = grievances.filter(g => g.status === 'In Progress').length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;
  const rejected = grievances.filter(g => g.status === 'Rejected').length;
  const withdrawn = grievances.filter(g => g.status === 'Withdrawn').length;

  const pending = submitted + underReview + assigned + inProgress;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

  // Calculate Average Resolution Time in Days/Hours
  let totalResolutionTimeMs = 0;
  let resolvedWithTimeCount = 0;

  grievances.forEach(g => {
    if (g.status === 'Resolved' && g.resolvedAt && g.submittedAt) {
      const diff = new Date(g.resolvedAt) - new Date(g.submittedAt);
      if (diff > 0) {
        totalResolutionTimeMs += diff;
        resolvedWithTimeCount += 1;
      }
    }
  });

  const avgResolutionHours = resolvedWithTimeCount > 0 
    ? (totalResolutionTimeMs / (resolvedWithTimeCount * 1000 * 60 * 60)).toFixed(1) 
    : 0;

  const avgResolutionDays = (avgResolutionHours / 24).toFixed(1);

  // Average Feedback Rating
  const totalRating = feedbacks.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
  const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : '0';

  // Urgent and high priority count
  const urgentCount = grievances.filter(g => (g.priority === 'Urgent' || g.priority === 'High') && g.status !== 'Resolved' && g.status !== 'Rejected' && g.status !== 'Withdrawn').length;

  // Department wise breakdown
  const departmentStats = departments.map(d => {
    const deptGrievances = grievances.filter(g => g.departmentId === d.id);
    const deptResolved = deptGrievances.filter(g => g.status === 'Resolved').length;
    const deptPending = deptGrievances.filter(g => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(g.status)).length;
    const rate = deptGrievances.length > 0 ? ((deptResolved / deptGrievances.length) * 100).toFixed(0) : '0';
    return {
      id: d.id,
      name: d.name,
      total: deptGrievances.length,
      resolved: deptResolved,
      pending: deptPending,
      rate
    };
  });

  // Officer wise breakdown
  const officerStats = officers.map(o => {
    const offGrievances = grievances.filter(g => g.officerId === o.id);
    const offResolved = offGrievances.filter(g => g.status === 'Resolved').length;
    const offPending = offGrievances.filter(g => g.status === 'In Progress' || g.status === 'Assigned').length;
    return {
      id: o.id,
      name: o.name,
      designation: o.designation,
      total: offGrievances.length,
      resolved: offResolved,
      pending: offPending
    };
  });

  return {
    total,
    submitted,
    underReview,
    assigned,
    inProgress,
    resolved,
    rejected,
    withdrawn,
    pending,
    resolutionRate,
    avgResolutionHours,
    avgResolutionDays,
    avgRating,
    urgentCount,
    departmentStats,
    officerStats
  };
};

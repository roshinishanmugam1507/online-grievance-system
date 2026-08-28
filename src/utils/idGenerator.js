/**
 * Generates unique complaint tracking IDs in format: GRV-YYYY-XXXXXX
 * (e.g. GRV-2026-000031)
 */
export const generateComplaintId = (existingGrievances = []) => {
  const currentYear = new Date().getFullYear();
  const prefix = `GRV-${currentYear}-`;
  
  // Find highest existing sequence number for current year
  let maxSeq = 0;
  existingGrievances.forEach(g => {
    if (g.complaintId && g.complaintId.startsWith(prefix)) {
      const numPart = parseInt(g.complaintId.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
};

export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
};

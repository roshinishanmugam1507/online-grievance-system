import React, { useState, useEffect } from 'react';
import RatingStars from '../common/RatingStars';

// -------------------------------------------------------------
// 1. Assign Department & Officer Modal (Admin)
// -------------------------------------------------------------
export const AssignModal = ({
  isOpen,
  grievance,
  departments = [],
  officers = [],
  onClose,
  onSubmit
}) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (grievance) {
      setSelectedDept(grievance.departmentId || '');
      setSelectedOfficer(grievance.officerId || '');
      setPriority(grievance.priority || 'Medium');
      setRemarks(grievance.adminRemarks || '');
    }
  }, [grievance]);

  if (!isOpen || !grievance) return null;

  // Filter officers belonging to selected department
  const filteredOfficers = selectedDept
    ? officers.filter((o) => o.departmentId === selectedDept && o.status === 'Active')
    : [];

  const handleDeptChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    setSelectedOfficer(''); // Reset officer when department changes
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      departmentId: selectedDept,
      officerId: selectedOfficer || null,
      priority,
      adminRemarks: remarks
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleFormSubmit}>
            <div className="modal-header bg-gov-primary text-white">
              <h5 className="modal-title fs-6 fw-bold">
                <i className="bi bi-person-check me-2"></i>
                Assign Grievance: {grievance.complaintId}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body py-3">
              <div className="mb-3">
                <label className="form-label">Grievance Title</label>
                <div className="p-2 bg-light rounded text-dark small fw-medium">{grievance.title}</div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedDept}
                    onChange={handleDeptChange}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.filter(d => d.status === 'Active').map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Assign Officer</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    disabled={!selectedDept}
                  >
                    <option value="">-- Select Officer ({filteredOfficers.length} available) --</option>
                    {filteredOfficers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Set Priority</label>
                <select
                  className="form-select form-select-sm"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">Administrative Remarks / Instructions</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter specific instructions or remarks for the assigned department/officer..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-4" disabled={!selectedDept}>
                <i className="bi bi-check2-circle me-1"></i> Save Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Status Update / Reject Modal
// -------------------------------------------------------------
export const StatusUpdateModal = ({
  isOpen,
  grievance,
  allowedStatuses = [],
  onClose,
  onSubmit
}) => {
  const [targetStatus, setTargetStatus] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (allowedStatuses.length > 0) {
      setTargetStatus(allowedStatuses[0]);
    }
  }, [allowedStatuses]);

  if (!isOpen || !grievance) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      status: targetStatus,
      remark: remark.trim()
    });
  };

  const isReject = targetStatus === 'Rejected';

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleFormSubmit}>
            <div className={`modal-header ${isReject ? 'bg-danger text-white' : 'bg-gov-primary text-white'}`}>
              <h5 className="modal-title fs-6 fw-bold">
                {isReject ? 'Reject Grievance' : 'Update Grievance Status'} : {grievance.complaintId}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body py-3">
              <div className="mb-3">
                <label className="form-label">New Status *</label>
                <select
                  className="form-select form-select-sm"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  required
                >
                  {allowedStatuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">
                  {isReject ? 'Reason for Rejection *' : 'Status Change Note / Remarks *'}
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={isReject ? 'Explain why this grievance is being rejected (e.g. duplicate, invalid info)...' : 'Add progress details...'}
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-${isReject ? 'danger' : 'primary'} btn-sm px-4`}
                disabled={!remark.trim()}
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Officer Resolution Modal
// -------------------------------------------------------------
export const ResolutionModal = ({
  isOpen,
  grievance,
  onClose,
  onSubmit
}) => {
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  if (!isOpen || !grievance) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullResolution = `${resolutionSummary.trim()} | Action Taken: ${actionTaken.trim()}`;
    onSubmit({
      resolutionDetails: fullResolution,
      status: 'Resolved'
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title fs-6 fw-bold">
                <i className="bi bi-check-circle-fill me-2"></i>
                Resolve Complaint: {grievance.complaintId}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body py-3">
              <div className="alert alert-success d-flex align-items-center py-2 px-3 small mb-3">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>
                  Resolving this grievance will notify the citizen and allow them to provide feedback.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Resolution Summary *</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="e.g., Road repaired with bitumen asphalt layer..."
                  required
                ></textarea>
              </div>

              <div className="mb-2">
                <label className="form-label">Action Taken Details *</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g., Inspection completed by Junior Engineer, contractor executed repairs, tested on site."
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success btn-sm px-4"
                disabled={!resolutionSummary.trim() || !actionTaken.trim()}
              >
                <i className="bi bi-check-lg me-1"></i> Submit Final Resolution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. Citizen Feedback Rating Modal
// -------------------------------------------------------------
export const FeedbackModal = ({
  isOpen,
  grievance,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen || !grievance) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      grievanceId: grievance.id,
      rating: Number(rating),
      comment: comment.trim()
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-gov-primary text-white">
              <h5 className="modal-title fs-6 fw-bold">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Rate Grievance Resolution
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body py-4 text-center">
              <h6 className="fw-bold text-dark mb-1">{grievance.title}</h6>
              <p className="text-muted small mb-3">Complaint ID: {grievance.complaintId}</p>

              <div className="mb-3">
                <label className="form-label d-block text-secondary">How satisfied are you with the redressal?</label>
                <div className="d-flex justify-content-center my-2">
                  <RatingStars
                    rating={rating}
                    interactive={true}
                    onRatingChange={(newRating) => setRating(newRating)}
                  />
                </div>
                <div className="fw-semibold text-warning small">
                  {rating === 5 && 'Outstanding - 5 Stars'}
                  {rating === 4 && 'Very Good - 4 Stars'}
                  {rating === 3 && 'Average - 3 Stars'}
                  {rating === 2 && 'Poor - 2 Stars'}
                  {rating === 1 && 'Very Dissatisfied - 1 Star'}
                </div>
              </div>

              <div className="text-start mt-4">
                <label className="form-label">Citizen Comments & Feedback *</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience regarding the timeliness and quality of resolution..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent btn-sm px-4"
                disabled={!comment.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

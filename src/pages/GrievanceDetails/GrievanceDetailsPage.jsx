import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllGrievances,
  updateGrievance,
  updateGrievanceStatus,
  withdrawGrievance
} from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { grievanceApi } from '../../services/grievanceApi';
import { feedbackApi } from '../../services/feedbackApi';
import storageService from '../../services/storageService';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RatingStars from '../../components/common/RatingStars';
import GrievanceTimeline from '../../components/grievance/GrievanceTimeline';
import AttachmentPreview from '../../components/grievance/AttachmentPreview';
import {
  AssignModal,
  StatusUpdateModal,
  ResolutionModal,
  FeedbackModal
} from '../../components/grievance/GrievanceActionModals';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const GrievanceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);

  const [grievance, setGrievance] = useState(null);
  const [trackingList, setTrackingList] = useState([]);
  const [feedbackRecord, setFeedbackRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const fetchFullDetails = async () => {
      setLoading(true);
      try {
        // Find grievance by id or complaintId
        const found = allGrievances.find((g) => g.id === id || g.complaintId === id);
        if (found) {
          setGrievance(found);
          storageService.createActivityLog({
            userId: user?.id || found.userId || 'CITIZEN',
            action: 'GRIEVANCE_VIEWED',
            referenceId: found.id,
            details: `Viewed grievance details (${found.complaintId || found.id})`
          }).catch(() => {});
          const [tracking, fb] = await Promise.all([
            grievanceApi.getTracking(found.id),
            feedbackApi.getAll({ grievanceId: found.id })
          ]);
          setTrackingList(tracking);
          setFeedbackRecord(fb && fb.length > 0 ? fb[0] : null);
        } else {
          // Direct API fallback
          const fetched = await grievanceApi.getById(id);
          setGrievance(fetched);
          const [tracking, fb] = await Promise.all([
            grievanceApi.getTracking(fetched.id),
            feedbackApi.getAll({ grievanceId: fetched.id })
          ]);
          setTrackingList(tracking);
          setFeedbackRecord(fb && fb.length > 0 ? fb[0] : null);
        }
      } catch (err) {
        console.error('Error fetching grievance details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [id, allGrievances]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2">Loading grievance dossier...</p>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="card text-center p-5 my-4">
        <h5 className="text-danger fw-bold">Grievance Record Not Found</h5>
        <p className="text-muted small">Could not locate grievance with identifier: {id}</p>
        <Link to="/grievances" className="btn btn-primary btn-sm mx-auto">
          Back to List
        </Link>
      </div>
    );
  }

  const dept = departments.find((d) => d.id === grievance.departmentId);
  const officer = officers.find((o) => o.id === grievance.officerId);

  // Role Permissions
  const isCitizenOwner = user?.id === grievance.userId && user?.role === 'citizen';
  const isAdmin = user?.role === 'admin';
  const isAssignedOfficer = user?.role === 'officer' && (grievance.officerId === user.id || officer?.userId === user.id);

  // Handlers
  const handleAssignSubmit = async (data) => {
    const updated = await dispatch(
      updateGrievance({
        id: grievance.id,
        data: {
          ...data,
          status: 'Assigned',
          updatedAt: new Date().toISOString()
        }
      })
    ).unwrap();

    const assignedOfficerName = officers.find((o) => o.id === data.officerId)?.name || 'Department Officer';
    const deptName = departments.find((d) => d.id === data.departmentId)?.name || 'Department';

    // Add tracking update
    await grievanceApi.addTracking({
      grievanceId: grievance.id,
      status: 'Assigned',
      message: `Assigned to ${deptName} -> ${assignedOfficerName}. Priority set to ${data.priority}. ${data.adminRemarks ? `Remarks: ${data.adminRemarks}` : ''}`,
      updatedBy: user?.name || 'Administrator',
      updatedByRole: 'admin'
    });

    // Refresh tracking
    const trk = await grievanceApi.getTracking(grievance.id);
    setTrackingList(trk);
    setGrievance(updated);
    setAssignModalOpen(false);

    dispatch(
      showToast({
        title: 'Assignment Updated',
        message: `Assigned to ${deptName} (${assignedOfficerName})`,
        type: 'success'
      })
    );
  };

  const handleStatusSubmit = async ({ status, remark }) => {
    const updated = await dispatch(
      updateGrievanceStatus({
        id: grievance.id,
        statusData: { status, adminRemarks: remark }
      })
    ).unwrap();

    await grievanceApi.addTracking({
      grievanceId: grievance.id,
      status,
      message: `Status updated to ${status}. Note: ${remark}`,
      updatedBy: user?.name || 'Authorized Officer',
      updatedByRole: user?.role || 'admin'
    });

    const trk = await grievanceApi.getTracking(grievance.id);
    setTrackingList(trk);
    setGrievance(updated);
    setStatusModalOpen(false);

    dispatch(
      showToast({
        title: 'Status Updated',
        message: `Grievance status changed to ${status}`,
        type: 'info'
      })
    );
  };

  const handleResolutionSubmit = async ({ resolutionDetails }) => {
    const updated = await dispatch(
      updateGrievance({
        id: grievance.id,
        data: {
          status: 'Resolved',
          resolutionDetails,
          resolvedAt: new Date().toISOString()
        }
      })
    ).unwrap();

    await grievanceApi.addTracking({
      grievanceId: grievance.id,
      status: 'Resolved',
      message: `Redressal completed. ${resolutionDetails}`,
      updatedBy: user?.name || 'Officer',
      updatedByRole: 'officer'
    });

    const trk = await grievanceApi.getTracking(grievance.id);
    setTrackingList(trk);
    setGrievance(updated);
    setResolutionModalOpen(false);

    dispatch(
      showToast({
        title: 'Grievance Resolved',
        message: 'Resolution details logged and citizen notified.',
        type: 'success'
      })
    );
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    const newFb = await feedbackApi.create({
      ...feedbackData,
      userId: user?.id,
      citizenName: user?.name
    });

    setFeedbackRecord(newFb);
    setFeedbackModalOpen(false);

    dispatch(
      showToast({
        title: 'Feedback Submitted',
        message: 'Thank you for rating the grievance redressal quality.',
        type: 'success'
      })
    );
  };

  const handleStartProcessing = async () => {
    const updated = await dispatch(
      updateGrievanceStatus({
        id: grievance.id,
        statusData: { status: 'In Progress' }
      })
    ).unwrap();

    await grievanceApi.addTracking({
      grievanceId: grievance.id,
      status: 'In Progress',
      message: `Officer ${user?.name} initiated field investigation and processing.`,
      updatedBy: user?.name || 'Officer',
      updatedByRole: 'officer'
    });

    const trk = await grievanceApi.getTracking(grievance.id);
    setTrackingList(trk);
    setGrievance(updated);

    dispatch(
      showToast({
        title: 'Processing Started',
        message: 'Case status moved to In Progress.',
        type: 'info'
      })
    );
  };

  const handleConfirmWithdraw = async () => {
    await dispatch(
      withdrawGrievance({
        id: grievance.id,
        reason: 'Citizen requested cancellation via portal.',
        citizenName: user?.name || 'Citizen'
      })
    );
    setWithdrawModalOpen(false);
    navigate('/grievances');
  };

  return (
    <div>
      {/* Top Breadcrumb & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark font-monospace px-2 py-1">
              {grievance.complaintId}
            </span>
            <PriorityBadge priority={grievance.priority} />
            <StatusBadge status={grievance.status} />
          </div>
          <h2 className="h4 fw-bold text-gov-primary mb-0">{grievance.title}</h2>
        </div>

        {/* Action Buttons depending on role */}
        <div className="d-flex flex-wrap gap-2">
          {/* Admin Controls */}
          {isAdmin && (
            <>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setAssignModalOpen(true)}
              >
                <i className="bi bi-person-check me-1"></i> Assign / Re-route
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setStatusModalOpen(true)}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Change Status
              </button>
            </>
          )}

          {/* Officer Controls */}
          {(isAssignedOfficer || isAdmin) && grievance.status === 'Assigned' && (
            <button className="btn btn-sm btn-primary" onClick={handleStartProcessing}>
              <i className="bi bi-play-circle me-1"></i> Start Processing
            </button>
          )}

          {(isAssignedOfficer || isAdmin) && grievance.status === 'In Progress' && (
            <button className="btn btn-sm btn-success" onClick={() => setResolutionModalOpen(true)}>
              <i className="bi bi-check-circle-fill me-1"></i> Submit Resolution
            </button>
          )}

          {/* Citizen Withdraw */}
          {isCitizenOwner && ['Submitted', 'Under Review'].includes(grievance.status) && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setWithdrawModalOpen(true)}
            >
              <i className="bi bi-x-circle me-1"></i> Withdraw Grievance
            </button>
          )}

          {/* Print Button */}
          <button
            className="btn btn-sm btn-light border"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-1"></i> Print
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Complaint & Assignment Dossier */}
        <div className="col-lg-7">
          {/* Section 1: Complaint Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-file-text-fill me-2 text-gov-accent"></i>
                Complaint Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <span className="small text-muted d-block">Category</span>
                  <strong className="text-dark small">{grievance.categoryId || 'General Civic'}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="small text-muted d-block">Submitted On</span>
                  <strong className="text-dark small">{formatDateTime(grievance.submittedAt)}</strong>
                </div>
                <div className="col-12">
                  <span className="small text-muted d-block">Location & Landmark</span>
                  <strong className="text-dark small">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {grievance.location}
                  </strong>
                </div>
              </div>

              <div className="mb-3">
                <label className="small text-muted d-block mb-1">Detailed Grievance Description</label>
                <div className="p-3 bg-light rounded text-dark small lh-base">
                  {grievance.description}
                </div>
              </div>

              {/* Supporting Document / Evidence Preview */}
              <div>
                <label className="small text-muted d-block mb-1">Supporting Document / Evidence</label>
                <AttachmentPreview attachment={grievance.attachment} />
              </div>
            </div>
          </div>

          {/* Section 2: Department & Officer Assignment */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-building-check me-2 text-primary"></i>
                Administrative Assignment
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="small text-muted d-block">Assigned Department</span>
                  <strong className="text-gov-primary">{dept?.name || 'Unassigned / Under Review'}</strong>
                  {dept && <div className="small text-muted">{dept.code} • {dept.phone}</div>}
                </div>
                <div className="col-sm-6">
                  <span className="small text-muted d-block">Field Officer</span>
                  <strong className="text-dark">{officer?.name || 'Not yet assigned'}</strong>
                  {officer && <div className="small text-muted">{officer.designation} • {officer.phone}</div>}
                </div>
              </div>

              {grievance.adminRemarks && (
                <div className="mt-3 p-2 bg-light border-start border-3 border-warning rounded">
                  <span className="small fw-semibold text-dark d-block">Admin Remarks:</span>
                  <span className="small text-secondary">{grievance.adminRemarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Redressal Resolution Details (When Resolved) */}
          {grievance.status === 'Resolved' && (
            <div className="card shadow-sm border-0 border-top border-4 border-success mb-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="h6 fw-bold mb-0 text-success">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Resolution & Redressal Details
                </h5>
                <span className="badge bg-success">Resolved</span>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <span className="small text-muted d-block">Action Taken & Final Report</span>
                  <div className="p-3 bg-success bg-opacity-10 rounded text-dark small mt-1">
                    {grievance.resolutionDetails || 'Issue inspected and rectified by department.'}
                  </div>
                </div>
                <div className="small text-muted">
                  Resolved on: <strong>{formatDateTime(grievance.resolvedAt || grievance.updatedAt)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Citizen Feedback Section */}
          {grievance.status === 'Resolved' && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="h6 fw-bold mb-0 text-gov-primary">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  Citizen Satisfaction Feedback
                </h5>
                {isCitizenOwner && !feedbackRecord && (
                  <button
                    className="btn btn-sm btn-accent"
                    onClick={() => setFeedbackModalOpen(true)}
                  >
                    <i className="bi bi-chat-heart me-1"></i> Rate Resolution
                  </button>
                )}
              </div>
              <div className="card-body">
                {feedbackRecord ? (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <RatingStars rating={feedbackRecord.rating} />
                      <span className="fw-bold small text-warning">
                        {feedbackRecord.rating} / 5 Stars
                      </span>
                      <span className="text-muted small ms-auto">
                        {formatDate(feedbackRecord.createdAt)}
                      </span>
                    </div>
                    <p className="small text-secondary mb-0 bg-light p-3 rounded">
                      "{feedbackRecord.comment}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted small">
                    <p className="mb-2">No citizen feedback has been provided for this resolved case yet.</p>
                    {isCitizenOwner && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => setFeedbackModalOpen(true)}
                      >
                        Provide Feedback Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Complete Lifecycle Tracking Timeline */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-clock-history me-2 text-gov-accent"></i>
                Official Lifecycle Timeline
              </h5>
            </div>
            <div className="card-body p-3">
              <GrievanceTimeline
                trackingEvents={trackingList}
                currentStatus={grievance.status}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={assignModalOpen}
        grievance={grievance}
        departments={departments}
        officers={officers}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
      />

      <StatusUpdateModal
        isOpen={statusModalOpen}
        grievance={grievance}
        allowedStatuses={['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleStatusSubmit}
      />

      <ResolutionModal
        isOpen={resolutionModalOpen}
        grievance={grievance}
        onClose={() => setResolutionModalOpen(false)}
        onSubmit={handleResolutionSubmit}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        grievance={grievance}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <ConfirmModal
        isOpen={withdrawModalOpen}
        title="Withdraw Complaint"
        message="Are you sure you want to withdraw this grievance?"
        confirmText="Confirm Withdrawal"
        confirmVariant="danger"
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default GrievanceDetailsPage;

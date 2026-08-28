import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { grievanceApi } from '../../services/grievanceApi';
import storageService from '../../services/storageService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import GrievanceTimeline from '../../components/grievance/GrievanceTimeline';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const TrackGrievancePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [inputQuery, setInputQuery] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);
  const [trackingData, setTrackingData] = useState([]);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [searchedGrievance, setSearchedGrievance] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);

  const executeTrack = async (complaintIdToSearch) => {
    if (!complaintIdToSearch.trim()) return;

    setNotFound(false);
    setSearchedId(complaintIdToSearch.trim());

    // Search in store
    const normalized = complaintIdToSearch.trim().toUpperCase();
    const found = allGrievances.find(
      (g) => g.complaintId?.toUpperCase() === normalized || g.id === complaintIdToSearch.trim()
    );

    if (found) {
      setSearchedGrievance(found);
      setLoadingTracking(true);
      try {
        const events = await grievanceApi.getTracking(found.id);
        setTrackingData(events);
        // Automatic activity log
        storageService.createActivityLog({
          userId: found.userId || 'CITIZEN',
          action: 'GRIEVANCE_TRACKED',
          referenceId: found.id,
          details: `Complaint tracked: ${found.complaintId || found.id}`
        }).catch(() => {});
      } catch (e) {
        console.error("Failed to load tracking:", e);
      } finally {
        setLoadingTracking(false);
      }
    } else {
      setSearchedGrievance(null);
      setTrackingData([]);
      setNotFound(true);
    }
  };

  useEffect(() => {
    if (initialId) {
      executeTrack(initialId);
    }
  }, [initialId, allGrievances]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ id: inputQuery.trim().toUpperCase() });
    executeTrack(inputQuery.trim().toUpperCase());
  };

  const getDept = (id) => departments.find((d) => d.id === id);
  const getOff = (id) => officers.find((o) => o.id === id);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <span className="badge bg-gov-primary px-3 py-1 text-white mb-2">
          <i className="bi bi-patch-check-fill me-1 text-warning"></i> Public Grievance Tracking Engine
        </span>
        <h2 className="fw-bold text-gov-primary">Live Complaint Status & Timeline</h2>
        <p className="text-muted small mx-auto" style={{ maxWidth: '520px' }}>
          Enter your unique Grievance Tracking ID to review the step-by-step progress, officer assignment, and official resolution notes.
        </p>

        {/* Search Input Box */}
        <div className="card shadow-sm border-0 mx-auto mt-3" style={{ maxWidth: '600px' }}>
          <div className="card-body p-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Complaint ID (e.g. GRV-2026-000001)"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-accent px-4 fw-bold">
                  Track Status
                </button>
              </div>
            </form>

            <div className="mt-2 text-start d-flex gap-2 align-items-center">
              <span className="small text-muted">Quick test:</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none small"
                onClick={() => {
                  setInputQuery('GRV-2026-000001');
                  executeTrack('GRV-2026-000001');
                }}
              >
                GRV-2026-000001 (In Progress)
              </button>
              <span className="text-muted">•</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none small"
                onClick={() => {
                  setInputQuery('GRV-2026-000002');
                  executeTrack('GRV-2026-000002');
                }}
              >
                GRV-2026-000002 (Resolved)
              </button>
            </div>
          </div>
        </div>
      </div>

      {notFound && (
        <div className="card text-center p-5 border-dashed shadow-sm max-w-lg mx-auto my-4" style={{ maxWidth: '600px' }}>
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-circle fs-1"></i>
          </div>
          <h5 className="fw-bold text-dark">Complaint ID Not Found</h5>
          <p className="text-muted small mb-0">
            No record exists for tracking number <strong>{searchedId}</strong>. Please verify the alphanumeric code and try again.
          </p>
        </div>
      )}

      {searchedGrievance && (
        <div className="row g-4 justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-sm border-0 mb-4">
              {/* Header */}
              <div className="card-header bg-gov-primary text-white p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark font-monospace px-2 py-1">
                      {searchedGrievance.complaintId}
                    </span>
                    <PriorityBadge priority={searchedGrievance.priority} />
                  </div>
                  <h4 className="fw-bold text-white mt-2 mb-0">{searchedGrievance.title}</h4>
                </div>
                <div>
                  <StatusBadge status={searchedGrievance.status} />
                </div>
              </div>

              <div className="card-body p-4">
                {/* Meta details grid */}
                <div className="row g-3 p-3 bg-light rounded-3 mb-4">
                  <div className="col-sm-6 col-md-3">
                    <span className="small text-muted d-block">Department</span>
                    <strong className="small text-dark">
                      {getDept(searchedGrievance.departmentId)?.name || searchedGrievance.categoryId || 'General'}
                    </strong>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <span className="small text-muted d-block">Assigned Officer</span>
                    <strong className="small text-dark">
                      {getOff(searchedGrievance.officerId)?.name || 'Not yet assigned'}
                    </strong>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <span className="small text-muted d-block">Registered Date</span>
                    <strong className="small text-dark">{formatDate(searchedGrievance.submittedAt)}</strong>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <span className="small text-muted d-block">Location</span>
                    <strong className="small text-dark text-truncate d-block">
                      <i className="bi bi-geo-alt text-danger me-1"></i>
                      {searchedGrievance.location}
                    </strong>
                  </div>
                </div>

                {/* Complaint Description */}
                <div className="mb-4">
                  <h6 className="fw-bold text-gov-primary">Complaint Description</h6>
                  <p className="text-secondary small mb-0">{searchedGrievance.description}</p>
                </div>

                {/* Resolution Summary (If Resolved) */}
                {searchedGrievance.status === 'Resolved' && searchedGrievance.resolutionDetails && (
                  <div className="alert alert-success p-3 rounded-3 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-check-circle-fill fs-5 text-success"></i>
                      <h6 className="fw-bold mb-0 text-success">Redressal & Resolution Report</h6>
                    </div>
                    <p className="small mb-1 text-dark">{searchedGrievance.resolutionDetails}</p>
                    <div className="small text-muted">
                      Resolved on: <strong>{formatDateTime(searchedGrievance.resolvedAt || searchedGrievance.updatedAt)}</strong>
                    </div>
                  </div>
                )}

                <hr className="my-4" />

                {/* Vertical Timeline */}
                <h5 className="fw-bold text-gov-primary mb-3">
                  <i className="bi bi-clock-history me-2 text-gov-accent"></i>
                  Official Redressal Timeline
                </h5>

                {loadingTracking ? (
                  <div className="text-center py-4 text-muted small">Loading timeline updates...</div>
                ) : (
                  <GrievanceTimeline
                    trackingEvents={trackingData}
                    currentStatus={searchedGrievance.status}
                  />
                )}
              </div>

              <div className="card-footer bg-white d-flex justify-content-between align-items-center p-3">
                <Link to={`/grievances/${searchedGrievance.id}`} className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-info-circle me-1"></i> Full Details & Feedback
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i> Print Tracking Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackGrievancePage;

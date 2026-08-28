import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllGrievances,
  updateGrievanceStatus,
  updateGrievance
} from '../../features/grievances/grievanceSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { grievanceApi } from '../../services/grievanceApi';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  ResolutionModal,
  StatusUpdateModal
} from '../../components/grievance/GrievanceActionModals';
import { Pagination, EmptyState, PageHeader } from '../../components/common/CommonComponents';
import { formatDate } from '../../utils/formatters';

export const OfficerGrievancesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const officers = useSelector(selectAllOfficers);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [resolutionModal, setResolutionModal] = useState({ isOpen: false, grievance: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, grievance: null });

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Find officer ID
  const officerProfile = useMemo(() => {
    return officers.find((o) => o.email === user?.email || o.userId === user?.id || o.id === user?.id);
  }, [officers, user]);

  const officerAssignedGrievances = useMemo(() => {
    const offId = officerProfile?.id || user?.id;
    return allGrievances.filter((g) => g.officerId === offId || g.officerId === 'off-1');
  }, [allGrievances, officerProfile, user]);

  const filteredGrievances = useMemo(() => {
    let list = [...officerAssignedGrievances];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.complaintId.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      list = list.filter((g) => g.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      list = list.filter((g) => g.priority === priorityFilter);
    }

    // Sort active first
    list.sort((a, b) => {
      const aActive = ['Assigned', 'In Progress'].includes(a.status);
      const bActive = ['Assigned', 'In Progress'].includes(b.status);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    return list;
  }, [officerAssignedGrievances, debouncedSearch, statusFilter, priorityFilter]);

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage
  } = usePagination(filteredGrievances, 8);

  // Start processing action
  const handleStartProcessing = async (g) => {
    await dispatch(
      updateGrievanceStatus({
        id: g.id,
        statusData: { status: 'In Progress' }
      })
    );

    await grievanceApi.addTracking({
      grievanceId: g.id,
      status: 'In Progress',
      message: `Field officer ${user?.name} began site inspection and rectification process.`,
      updatedBy: user?.name || 'Officer',
      updatedByRole: 'officer'
    });

    dispatch(
      showToast({
        title: 'Status Updated',
        message: `${g.complaintId} is now In Progress.`,
        type: 'info'
      })
    );
  };

  // Submit progress note
  const handleProgressSubmit = async ({ status, remark }) => {
    const g = progressModal.grievance;
    if (!g) return;

    await dispatch(
      updateGrievanceStatus({
        id: g.id,
        statusData: { status }
      })
    );

    await grievanceApi.addTracking({
      grievanceId: g.id,
      status,
      message: `Progress update by officer: ${remark}`,
      updatedBy: user?.name || 'Officer',
      updatedByRole: 'officer'
    });

    setProgressModal({ isOpen: false, grievance: null });
    dispatch(
      showToast({
        title: 'Progress Update Logged',
        message: 'Status and remarks updated.',
        type: 'success'
      })
    );
  };

  // Submit Final Resolution
  const handleResolutionSubmit = async ({ resolutionDetails }) => {
    const g = resolutionModal.grievance;
    if (!g) return;

    await dispatch(
      updateGrievance({
        id: g.id,
        data: {
          status: 'Resolved',
          resolutionDetails,
          resolvedAt: new Date().toISOString()
        }
      })
    );

    await grievanceApi.addTracking({
      grievanceId: g.id,
      status: 'Resolved',
      message: `Resolution completed: ${resolutionDetails}`,
      updatedBy: user?.name || 'Officer',
      updatedByRole: 'officer'
    });

    setResolutionModal({ isOpen: false, grievance: null });
    dispatch(
      showToast({
        title: 'Grievance Resolved',
        message: `Complaint ${g.complaintId} marked as Resolved.`,
        type: 'success'
      })
    );
  };

  return (
    <div>
      <PageHeader
        title="Assigned Complaints Work Queue"
        subtitle={`Roster of ${officerAssignedGrievances.length} grievances assigned to your jurisdiction.`}
      />

      {/* Filter and Search */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search complaint ID, subject, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned (Awaiting Action)</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="col-sm-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grievance Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {paginatedItems.length === 0 ? (
            <EmptyState
              title="No Assigned Cases"
              description="No grievances match the selected filter."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Complaint Title & Location</th>
                    <th>Citizen Contact</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((g) => {
                    const isAssigned = g.status === 'Assigned';
                    const isInProgress = g.status === 'In Progress';
                    const isResolved = g.status === 'Resolved';

                    return (
                      <tr key={g.id}>
                        <td>
                          <Link
                            to={`/officer/grievances/${g.id}`}
                            className="fw-bold font-monospace text-decoration-none"
                          >
                            {g.complaintId}
                          </Link>
                        </td>
                        <td>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                            {g.title}
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {g.location}
                          </div>
                        </td>
                        <td>
                          <div className="small text-dark">{g.citizenName || 'Citizen'}</div>
                          <div className="small text-muted">{g.citizenPhone || g.citizenEmail || 'Contact on file'}</div>
                        </td>
                        <td>
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td>
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="small text-muted">{formatDate(g.submittedAt)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Link
                              to={`/officer/grievances/${g.id}`}
                              className="btn btn-sm btn-outline-secondary"
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>

                            {isAssigned && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleStartProcessing(g)}
                                title="Start Processing"
                              >
                                <i className="bi bi-play-fill me-1"></i> Start
                              </button>
                            )}

                            {isInProgress && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => setProgressModal({ isOpen: true, grievance: g })}
                                  title="Add Progress Note"
                                >
                                  <i className="bi bi-chat-dots"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => setResolutionModal({ isOpen: true, grievance: g })}
                                  title="Resolve Case"
                                >
                                  <i className="bi bi-check-lg me-1"></i> Resolve
                                </button>
                              </>
                            )}

                            {isResolved && (
                              <span className="badge bg-success bg-opacity-10 text-success small py-2 px-2">
                                <i className="bi bi-check-circle-fill me-1"></i> Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-white px-3 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Progress update modal */}
      <StatusUpdateModal
        isOpen={progressModal.isOpen}
        grievance={progressModal.grievance}
        allowedStatuses={['In Progress', 'Under Review', 'Rejected']}
        onClose={() => setProgressModal({ isOpen: false, grievance: null })}
        onSubmit={handleProgressSubmit}
      />

      {/* Resolution modal */}
      <ResolutionModal
        isOpen={resolutionModal.isOpen}
        grievance={resolutionModal.grievance}
        onClose={() => setResolutionModal({ isOpen: false, grievance: null })}
        onSubmit={handleResolutionSubmit}
      />
    </div>
  );
};

export default OfficerGrievancesPage;

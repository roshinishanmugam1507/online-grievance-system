import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllGrievances,
  updateGrievance,
  updateGrievanceStatus
} from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { grievanceApi } from '../../services/grievanceApi';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportCSV';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  AssignModal,
  StatusUpdateModal
} from '../../components/grievance/GrievanceActionModals';
import { Pagination, EmptyState, PageHeader } from '../../components/common/CommonComponents';
import { formatDate } from '../../utils/formatters';

export const AdminGrievancesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);
  const user = useSelector((state) => state.auth.user);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Action Modals State
  const [assignModal, setAssignModal] = useState({ isOpen: false, grievance: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, grievance: null });

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Filter and sort
  const filteredGrievances = useMemo(() => {
    let list = [...allGrievances];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.complaintId.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          (g.citizenName && g.citizenName.toLowerCase().includes(q)) ||
          g.location.toLowerCase().includes(q) ||
          (g.categoryId && g.categoryId.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'All') {
      list = list.filter((g) => g.status === statusFilter);
    }

    if (deptFilter !== 'All') {
      list = list.filter((g) => g.departmentId === deptFilter);
    }

    if (priorityFilter !== 'All') {
      list = list.filter((g) => g.priority === priorityFilter);
    }

    if (officerFilter !== 'All') {
      list = list.filter((g) => g.officerId === officerFilter);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sortBy === 'priority') {
      const pOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      list.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    }

    return list;
  }, [allGrievances, debouncedSearch, statusFilter, deptFilter, priorityFilter, officerFilter, sortBy]);

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage
  } = usePagination(filteredGrievances, 9);

  const getDept = (id) => departments.find((d) => d.id === id);
  const getOff = (id) => officers.find((o) => o.id === id);

  // Handle assignment
  const handleAssignSubmit = async (data) => {
    const g = assignModal.grievance;
    if (!g) return;

    const updated = await dispatch(
      updateGrievance({
        id: g.id,
        data: {
          ...data,
          status: 'Assigned',
          updatedAt: new Date().toISOString()
        }
      })
    ).unwrap();

    const assignedOfficerName = officers.find((o) => o.id === data.officerId)?.name || 'Department Officer';
    const deptName = departments.find((d) => d.id === data.departmentId)?.name || 'Department';

    await grievanceApi.addTracking({
      grievanceId: g.id,
      status: 'Assigned',
      message: `Assigned to ${deptName} -> ${assignedOfficerName}. Priority: ${data.priority}. ${data.adminRemarks ? `Remarks: ${data.adminRemarks}` : ''}`,
      updatedBy: user?.name || 'Administrator',
      updatedByRole: 'admin'
    });

    setAssignModal({ isOpen: false, grievance: null });
    dispatch(
      showToast({
        title: 'Assignment Successful',
        message: `${g.complaintId} assigned to ${deptName}`,
        type: 'success'
      })
    );
  };

  // Handle status update / reject
  const handleStatusSubmit = async ({ status, remark }) => {
    const g = statusModal.grievance;
    if (!g) return;

    await dispatch(
      updateGrievanceStatus({
        id: g.id,
        statusData: { status, adminRemarks: remark }
      })
    ).unwrap();

    await grievanceApi.addTracking({
      grievanceId: g.id,
      status,
      message: `Admin updated status to ${status}. Remarks: ${remark}`,
      updatedBy: user?.name || 'Administrator',
      updatedByRole: 'admin'
    });

    setStatusModal({ isOpen: false, grievance: null });
    dispatch(
      showToast({
        title: 'Status Updated',
        message: `${g.complaintId} marked as ${status}`,
        type: 'info'
      })
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const exportData = filteredGrievances.map((g) => ({
      ComplaintID: g.complaintId,
      CitizenName: g.citizenName || 'N/A',
      Title: g.title,
      Category: g.categoryId || 'General',
      Department: getDept(g.departmentId)?.name || 'Unassigned',
      Officer: getOff(g.officerId)?.name || 'Unassigned',
      Priority: g.priority,
      Status: g.status,
      Location: g.location,
      SubmittedDate: formatDate(g.submittedAt)
    }));
    exportToCSV(exportData, `PGRS_Grievances_${Date.now()}.csv`);
  };

  return (
    <div>
      <PageHeader
        title="Grievance Master Management"
        subtitle={`Review all ${allGrievances.length} public grievances, assign departments and officers, and monitor SLA resolution.`}
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-success" onClick={handleExportCSV}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Print View
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            {/* Search */}
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search ID, title, citizen, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Department */}
            <div className="col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sort */}
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">High Priority First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grievances Master Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {paginatedItems.length === 0 ? (
            <EmptyState
              title="No Grievances Found"
              description="No grievances match the specified criteria. Try clearing some filters."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Citizen & Title</th>
                    <th>Department</th>
                    <th>Officer</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((g) => {
                    const deptObj = getDept(g.departmentId);
                    const offObj = getOff(g.officerId);

                    return (
                      <tr key={g.id}>
                        <td>
                          <Link to={`/admin/grievances/${g.id}`} className="fw-bold font-monospace text-decoration-none">
                            {g.complaintId}
                          </Link>
                        </td>
                        <td>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                            {g.title}
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-person me-1"></i> {g.citizenName || 'Citizen'} • <i className="bi bi-geo-alt me-1 text-danger"></i>{g.location}
                          </div>
                        </td>
                        <td>
                          <span className="small text-dark fw-medium">
                            {deptObj?.name || <span className="text-muted italic">Unassigned</span>}
                          </span>
                        </td>
                        <td>
                          <span className="small text-secondary">
                            {offObj?.name || <span className="badge bg-light text-muted border">None</span>}
                          </span>
                        </td>
                        <td>
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td>
                          <StatusBadge status={g.status} />
                        </td>
                        <td>
                          <span className="small text-muted">{formatDate(g.submittedAt)}</span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Link
                              to={`/admin/grievances/${g.id}`}
                              className="btn btn-sm btn-outline-primary"
                              title="Full Inspection"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>

                            <button
                              className="btn btn-sm btn-outline-secondary"
                              title="Assign Department / Officer"
                              onClick={() => setAssignModal({ isOpen: true, grievance: g })}
                            >
                              <i className="bi bi-person-check"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-dark"
                              title="Change Status / Review"
                              onClick={() => setStatusModal({ isOpen: true, grievance: g })}
                            >
                              <i className="bi bi-gear"></i>
                            </button>
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

      {/* Modals */}
      <AssignModal
        isOpen={assignModal.isOpen}
        grievance={assignModal.grievance}
        departments={departments}
        officers={officers}
        onClose={() => setAssignModal({ isOpen: false, grievance: null })}
        onSubmit={handleAssignSubmit}
      />

      <StatusUpdateModal
        isOpen={statusModal.isOpen}
        grievance={statusModal.grievance}
        allowedStatuses={['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']}
        onClose={() => setStatusModal({ isOpen: false, grievance: null })}
        onSubmit={handleStatusSubmit}
      />
    </div>
  );
};

export default AdminGrievancesPage;

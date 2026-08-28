import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllGrievances, withdrawGrievance } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Pagination, EmptyState, PageHeader } from '../../components/common/CommonComponents';
import { formatDate } from '../../utils/formatters';

export const MyGrievancesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Withdraw Modal State
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    grievance: null,
    reason: ''
  });

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Filter grievances belonging to this user
  const myGrievances = useMemo(() => {
    return allGrievances.filter((g) => g.userId === user?.id);
  }, [allGrievances, user?.id]);

  // Apply filters, search & sorting
  const filteredGrievances = useMemo(() => {
    let result = [...myGrievances];

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.complaintId.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q) ||
          (g.categoryId && g.categoryId.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter === 'Pending') {
      result = result.filter((g) =>
        ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(g.status)
      );
    } else if (statusFilter !== 'All') {
      result = result.filter((g) => g.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      result = result.filter((g) => g.priority === priorityFilter);
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sortBy === 'priority') {
      const pOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    }

    return result;
  }, [myGrievances, debouncedSearch, statusFilter, priorityFilter, sortBy]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage
  } = usePagination(filteredGrievances, 7);

  // Department name helper
  const getDeptName = (deptId) => {
    const d = departments.find((dept) => dept.id === deptId);
    return d ? d.name : 'Unassigned';
  };

  // Withdraw action handler
  const handleOpenWithdraw = (grievance) => {
    setWithdrawModal({
      isOpen: true,
      grievance,
      reason: 'Issue resolved through alternate means or no longer exists.'
    });
  };

  const handleConfirmWithdraw = async () => {
    if (!withdrawModal.grievance) return;
    const g = withdrawModal.grievance;

    await dispatch(
      withdrawGrievance({
        id: g.id,
        reason: withdrawModal.reason,
        citizenName: user?.name || 'Citizen'
      })
    );

    dispatch(
      showToast({
        title: 'Grievance Withdrawn',
        message: `Complaint ${g.complaintId} has been marked as withdrawn.`,
        type: 'info'
      })
    );

    setWithdrawModal({ isOpen: false, grievance: null, reason: '' });
  };

  return (
    <div>
      <PageHeader
        title="My Registered Grievances"
        subtitle={`Track, manage, and view status history of all ${myGrievances.length} grievances filed by you.`}
        action={
          <Link to="/grievances/new" className="btn btn-accent btn-sm">
            <i className="bi bi-plus-circle-fill me-1"></i> File New Grievance
          </Link>
        }
      />

      {/* Filter and Search Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            {/* Search Box */}
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Complaint ID, Title, or Location..."
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

            {/* Status Filter */}
            <div className="col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">All Pending / Active</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Priority Filter */}
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

            {/* Sort Order */}
            <div className="col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="priority">Sort: Highest Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grievances Table / Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {paginatedItems.length === 0 ? (
            <EmptyState
              title="No Matching Grievances"
              description="No grievances match the selected filters or search keyword."
              actionButton={
                (searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') ? (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All');
                      setPriorityFilter('All');
                    }}
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link to="/grievances/new" className="btn btn-primary btn-sm">
                    <i className="bi bi-plus-lg me-1"></i> Register a Complaint
                  </Link>
                )
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Complaint Title & Category</th>
                    <th>Department</th>
                    <th>Submitted</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((g) => {
                    const isWithdrawable = ['Submitted', 'Under Review'].includes(g.status);

                    return (
                      <tr key={g.id}>
                        <td>
                          <Link to={`/grievances/${g.id}`} className="fw-bold text-decoration-none font-monospace">
                            {g.complaintId}
                          </Link>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '280px' }}>
                            {g.title}
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-geo-alt me-1 text-danger"></i>
                            {g.location}
                          </div>
                        </td>
                        <td>
                          <span className="small text-muted">{getDeptName(g.departmentId)}</span>
                        </td>
                        <td>
                          <span className="small text-muted">{formatDate(g.submittedAt)}</span>
                        </td>
                        <td>
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td>
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Link
                              to={`/grievances/${g.id}`}
                              className="btn btn-sm btn-outline-primary"
                              title="View Full Details"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>

                            {isWithdrawable && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Withdraw Complaint"
                                onClick={() => handleOpenWithdraw(g)}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
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

        {/* Pagination bar */}
        <div className="card-footer bg-white px-3 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      <ConfirmModal
        isOpen={withdrawModal.isOpen}
        title="Withdraw Grievance"
        message={`Are you sure you want to withdraw complaint ${withdrawModal.grievance?.complaintId}? Withdrawing will close this case without further administrative action.`}
        confirmText="Yes, Withdraw Complaint"
        confirmVariant="danger"
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawModal({ isOpen: false, grievance: null, reason: '' })}
      >
        <div className="mt-3 text-start">
          <label className="form-label small fw-semibold">Reason for Withdrawal *</label>
          <textarea
            className="form-control form-control-sm"
            rows="2"
            value={withdrawModal.reason}
            onChange={(e) => setWithdrawModal((prev) => ({ ...prev, reason: e.target.value }))}
            required
          ></textarea>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default MyGrievancesPage;

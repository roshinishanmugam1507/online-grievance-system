import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrievances, selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { StatCard, PageHeader } from '../../components/common/CommonComponents';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ReportChart from '../../components/reports/ReportChart';
import { formatDate } from '../../utils/formatters';

export const OfficerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const officers = useSelector(selectAllOfficers);

  useEffect(() => {
    dispatch(fetchGrievances());
  }, [dispatch]);

  // Find officer record linked to user
  const officerProfile = useMemo(() => {
    return officers.find((o) => o.email === user?.email || o.userId === user?.id || o.id === user?.id);
  }, [officers, user]);

  // Filter grievances assigned to this officer
  const myAssignedGrievances = useMemo(() => {
    const officerId = officerProfile?.id || user?.id;
    return allGrievances.filter((g) => g.officerId === officerId || g.officerId === 'off-1');
  }, [allGrievances, officerProfile, user]);

  const totalAssigned = myAssignedGrievances.length;
  const pendingWork = myAssignedGrievances.filter((g) => g.status === 'Assigned').length;
  const inProgress = myAssignedGrievances.filter((g) => g.status === 'In Progress').length;
  const resolved = myAssignedGrievances.filter((g) => g.status === 'Resolved').length;

  const urgentCases = myAssignedGrievances.filter(
    (g) => (g.priority === 'Urgent' || g.priority === 'High') && g.status !== 'Resolved'
  );

  const statusChartData = {
    labels: ['Assigned (Pending)', 'In Progress', 'Resolved', 'Other'],
    datasets: [
      {
        data: [
          pendingWork,
          inProgress,
          resolved,
          myAssignedGrievances.filter((g) => ['Rejected', 'Withdrawn'].includes(g.status)).length
        ],
        backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#94a3b8'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <PageHeader
        title={`Officer Desk - ${user?.name || 'Field Officer'}`}
        subtitle={`Designation: ${officerProfile?.designation || 'Assistant Executive Engineer'} • Zone: ${officerProfile?.zone || 'Zone 8'}`}
        action={
          <Link to="/officer/grievances" className="btn btn-primary btn-sm">
            <i className="bi bi-briefcase-fill me-1"></i> View Assigned Roster ({totalAssigned})
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Assigned"
            value={totalAssigned}
            icon="bi-briefcase-fill"
            bgColor="#eff6ff"
            iconColor="#1d4ed8"
            onClick={() => navigate('/officer/grievances')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Awaiting Action"
            value={pendingWork}
            icon="bi-clock-fill"
            bgColor="#fffbeb"
            iconColor="#b45309"
            onClick={() => navigate('/officer/grievances?status=Assigned')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Active In-Progress"
            value={inProgress}
            icon="bi-gear-wide-connected"
            bgColor="#fef3c7"
            iconColor="#d97706"
            onClick={() => navigate('/officer/grievances?status=In Progress')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Resolved Cases"
            value={resolved}
            icon="bi-check-circle-fill"
            bgColor="#ecfdf5"
            iconColor="#059669"
            onClick={() => navigate('/officer/grievances?status=Resolved')}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Assigned Grievances List */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-list-task me-2 text-gov-accent"></i>
                Active Work Queue
              </h5>
              <Link to="/officer/grievances" className="small text-decoration-none fw-semibold">
                Manage All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Title & Location</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAssignedGrievances.slice(0, 5).map((g) => (
                      <tr key={g.id}>
                        <td>
                          <Link to={`/officer/grievances/${g.id}`} className="fw-bold font-monospace text-decoration-none">
                            {g.complaintId}
                          </Link>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                            {g.title}
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-geo-alt me-1 text-danger"></i>
                            {g.location}
                          </div>
                        </td>
                        <td><PriorityBadge priority={g.priority} /></td>
                        <td><StatusBadge status={g.status} /></td>
                        <td className="small text-muted">{formatDate(g.submittedAt)}</td>
                        <td className="text-end">
                          <Link to={`/officer/grievances/${g.id}`} className="btn btn-sm btn-outline-primary">
                            Take Action
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution & Urgent Box */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                Caseload Distribution
              </h5>
            </div>
            <div className="card-body">
              <ReportChart type="doughnut" data={statusChartData} height={200} />
            </div>
          </div>

          {/* Urgent Case Box */}
          <div className="card shadow-sm border-0 border-top border-3 border-danger">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-danger">
                <i className="bi bi-exclamation-octagon-fill me-2"></i>
                High Priority Alerts ({urgentCases.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {urgentCases.length === 0 ? (
                <div className="p-3 text-center text-muted small">No urgent pending cases.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {urgentCases.slice(0, 3).map((g) => (
                    <Link
                      key={g.id}
                      to={`/officer/grievances/${g.id}`}
                      className="list-group-item list-group-item-action p-3 text-decoration-none"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-danger">{g.priority}</span>
                        <span className="small text-muted">{g.complaintId}</span>
                      </div>
                      <div className="fw-semibold text-dark small text-truncate">{g.title}</div>
                      <div className="small text-muted">{g.location}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;

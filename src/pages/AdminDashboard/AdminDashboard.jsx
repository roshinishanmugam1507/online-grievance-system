import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrievances, selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { fetchDepartments, selectAllDepartments } from '../../features/departments/departmentSlice';
import { fetchOfficers, selectAllOfficers } from '../../features/officers/officerSlice';
import { fetchFeedback } from '../../features/tracking/trackingAndMiscSlices';
import { StatCard, PageHeader } from '../../components/common/CommonComponents';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ReportChart from '../../components/reports/ReportChart';
import { calculateGrievanceMetrics } from '../../utils/reportUtils';
import { formatDate } from '../../utils/formatters';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);
  const feedbacks = useSelector((state) => state.feedback.items);

  useEffect(() => {
    dispatch(fetchGrievances());
    dispatch(fetchDepartments());
    dispatch(fetchOfficers());
    dispatch(fetchFeedback());
  }, [dispatch]);

  const metrics = useMemo(() => {
    return calculateGrievanceMetrics(allGrievances, departments, officers, feedbacks);
  }, [allGrievances, departments, officers, feedbacks]);

  // Urgent grievances that require attention
  const urgentGrievances = useMemo(() => {
    return allGrievances
      .filter((g) => (g.priority === 'Urgent' || g.priority === 'High') && g.status !== 'Resolved' && g.status !== 'Rejected' && g.status !== 'Withdrawn')
      .slice(0, 5);
  }, [allGrievances]);

  // Unassigned grievances
  const unassignedGrievances = useMemo(() => {
    return allGrievances
      .filter((g) => g.status === 'Submitted' || !g.departmentId || !g.officerId)
      .slice(0, 5);
  }, [allGrievances]);

  // Status Chart Data
  const statusChartData = {
    labels: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected/Withdrawn'],
    datasets: [
      {
        data: [
          metrics.submitted,
          metrics.underReview,
          metrics.assigned,
          metrics.inProgress,
          metrics.resolved,
          metrics.rejected + metrics.withdrawn
        ],
        backgroundColor: ['#64748b', '#0284c7', '#6366f1', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 1
      }
    ]
  };

  // Department Distribution Chart Data
  const deptChartData = {
    labels: metrics.departmentStats.map((d) => d.name.split(' ')[0]),
    datasets: [
      {
        label: 'Resolved',
        data: metrics.departmentStats.map((d) => d.resolved),
        backgroundColor: '#10b981'
      },
      {
        label: 'Pending',
        data: metrics.departmentStats.map((d) => d.pending),
        backgroundColor: '#f59e0b'
      }
    ]
  };

  return (
    <div>
      <PageHeader
        title="Administrative Master Dashboard"
        subtitle="Executive oversight of public grievance registrations, departmental performance, and redressal SLAs."
        action={
          <div className="d-flex gap-2">
            <Link to="/admin/reports" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-file-earmark-bar-graph me-1"></i> Executive Reports
            </Link>
            <Link to="/admin/grievances" className="btn btn-primary btn-sm">
              <i className="bi bi-inbox-fill me-1"></i> Manage All ({metrics.total})
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Total Logged"
            value={metrics.total}
            icon="bi-archive-fill"
            bgColor="#eff6ff"
            iconColor="#1d4ed8"
            onClick={() => navigate('/admin/grievances')}
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Submitted"
            value={metrics.submitted}
            icon="bi-file-earmark-text"
            bgColor="#f1f5f9"
            iconColor="#475569"
            onClick={() => navigate('/admin/grievances?status=Submitted')}
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="In Review / Assigned"
            value={metrics.underReview + metrics.assigned}
            icon="bi-person-badge"
            bgColor="#eef2ff"
            iconColor="#4f46e5"
            onClick={() => navigate('/admin/grievances?status=Assigned')}
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="In Progress"
            value={metrics.inProgress}
            icon="bi-gear-wide-connected"
            bgColor="#fffbeb"
            iconColor="#b45309"
            onClick={() => navigate('/admin/grievances?status=In Progress')}
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Resolved"
            value={metrics.resolved}
            icon="bi-check-circle-fill"
            bgColor="#ecfdf5"
            iconColor="#059669"
            trend={{ isPositive: true, text: `${metrics.resolutionRate}% Rate` }}
            onClick={() => navigate('/admin/grievances?status=Resolved')}
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Urgent Alerts"
            value={metrics.urgentCount}
            icon="bi-exclamation-octagon-fill"
            bgColor="#fef2f2"
            iconColor="#dc2626"
            onClick={() => navigate('/admin/grievances?priority=Urgent')}
          />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                Grievance Status Breakdown
              </h5>
              <span className="badge bg-light text-secondary border">Overall Statuses</span>
            </div>
            <div className="card-body">
              <ReportChart type="doughnut" data={statusChartData} height={230} />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-bar-chart-fill me-2 text-gov-accent"></i>
                Departmental Caseload (Resolved vs Pending)
              </h5>
              <span className="badge bg-light text-secondary border">Department Performance</span>
            </div>
            <div className="card-body">
              <ReportChart
                type="bar"
                data={deptChartData}
                height={230}
                options={{
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Tables: Urgent Attention & Unassigned Cases */}
      <div className="row g-4 mb-4">
        {/* Urgent Attention Table */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h5 className="h6 fw-bold mb-0 text-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Urgent Attention Required ({urgentGrievances.length})
              </h5>
              <Link to="/admin/grievances?priority=Urgent" className="small text-danger text-decoration-none fw-semibold">
                View All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentGrievances.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted small">
                          No pending urgent cases. All high-priority complaints addressed.
                        </td>
                      </tr>
                    ) : (
                      urgentGrievances.map((g) => (
                        <tr key={g.id}>
                          <td>
                            <Link to={`/admin/grievances/${g.id}`} className="fw-bold font-monospace text-decoration-none">
                              {g.complaintId}
                            </Link>
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate small" style={{ maxWidth: '200px' }}>
                              {g.title}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{g.location}</div>
                          </td>
                          <td><PriorityBadge priority={g.priority} /></td>
                          <td><StatusBadge status={g.status} /></td>
                          <td className="text-end">
                            <Link to={`/admin/grievances/${g.id}`} className="btn btn-xs btn-outline-primary py-1 px-2 small">
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Unassigned / Review Queue Table */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-inbox-fill me-2 text-warning"></i>
                New Submissions / Unassigned Queue
              </h5>
              <Link to="/admin/grievances?status=Submitted" className="small text-decoration-none fw-semibold">
                Review Queue <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedGrievances.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted small">
                          Queue is clear. No unassigned grievances pending.
                        </td>
                      </tr>
                    ) : (
                      unassignedGrievances.map((g) => (
                        <tr key={g.id}>
                          <td>
                            <Link to={`/admin/grievances/${g.id}`} className="fw-bold font-monospace text-decoration-none">
                              {g.complaintId}
                            </Link>
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate small" style={{ maxWidth: '200px' }}>
                              {g.title}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{g.categoryId}</div>
                          </td>
                          <td className="small text-muted">{formatDate(g.submittedAt)}</td>
                          <td><StatusBadge status={g.status} /></td>
                          <td className="text-end">
                            <Link to={`/admin/grievances/${g.id}`} className="btn btn-xs btn-primary py-1 px-2 small">
                              Assign
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Officer Workload Quick Summary */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="h6 fw-bold mb-0 text-gov-primary">
            <i className="bi bi-person-badge-fill me-2 text-primary"></i>
            Officer Workload Summary
          </h5>
          <Link to="/admin/officers" className="small text-decoration-none">
            Manage Officers <i className="bi bi-chevron-right"></i>
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Designation</th>
                  <th>Total Assigned</th>
                  <th>Active Cases</th>
                  <th>Resolved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.officerStats.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="fw-bold text-dark">{o.name}</div>
                    </td>
                    <td className="small text-muted">{o.designation}</td>
                    <td><span className="badge bg-light text-dark border">{o.total}</span></td>
                    <td>
                      <span className={`badge ${o.pending > 2 ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                        {o.pending} Active
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                        {o.resolved}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success small">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

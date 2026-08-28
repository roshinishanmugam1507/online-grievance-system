import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrievances, selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { fetchNotifications, selectAllNotifications } from '../../features/notifications/notificationSlice';
import { StatCard, PageHeader, EmptyState } from '../../components/common/CommonComponents';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ReportChart from '../../components/reports/ReportChart';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export const CitizenDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const notifications = useSelector(selectAllNotifications);

  useEffect(() => {
    dispatch(fetchGrievances());
    if (user?.id) {
      dispatch(fetchNotifications({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  // Filter only current citizen's grievances
  const myGrievances = allGrievances.filter((g) => g.userId === user?.id);

  const total = myGrievances.length;
  const pending = myGrievances.filter((g) => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(g.status)).length;
  const inProgress = myGrievances.filter((g) => g.status === 'In Progress').length;
  const resolved = myGrievances.filter((g) => g.status === 'Resolved').length;

  const userNotifs = notifications.filter((n) => !n.userId || n.userId === user?.id);

  // Department name helper
  const getDeptName = (deptId) => {
    const d = departments.find((dept) => dept.id === deptId);
    return d ? d.name : 'General Public Services';
  };

  // Status Distribution for Citizen Chart
  const statusCounts = {
    Submitted: myGrievances.filter((g) => g.status === 'Submitted').length,
    'In Progress': myGrievances.filter((g) => ['Under Review', 'Assigned', 'In Progress'].includes(g.status)).length,
    Resolved: resolved,
    Others: myGrievances.filter((g) => ['Rejected', 'Withdrawn'].includes(g.status)).length
  };

  const chartData = {
    labels: ['Submitted', 'In Progress / Assigned', 'Resolved', 'Other / Closed'],
    datasets: [
      {
        data: [
          statusCounts.Submitted,
          statusCounts['In Progress'],
          statusCounts.Resolved,
          statusCounts.Others
        ],
        backgroundColor: ['#64748b', '#f59e0b', '#10b981', '#94a3b8'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name || 'Citizen'}`}
        subtitle="Manage your filed grievances, track real-time redressal progress, and communicate feedback."
        action={
          <div className="d-flex gap-2">
            <Link to="/track" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-search me-1"></i> Track ID
            </Link>
            <Link to="/grievances/new" className="btn btn-accent btn-sm">
              <i className="bi bi-plus-circle-fill me-1"></i> File New Grievance
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Registered"
            value={total}
            icon="bi-folder2-open"
            bgColor="#eff6ff"
            iconColor="#1d4ed8"
            onClick={() => navigate('/grievances')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Pending Redressal"
            value={pending}
            icon="bi-hourglass-split"
            bgColor="#fffbeb"
            iconColor="#b45309"
            onClick={() => navigate('/grievances?status=Pending')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Active In-Progress"
            value={inProgress}
            icon="bi-gear-wide-connected"
            bgColor="#f0fdf4"
            iconColor="#047857"
            onClick={() => navigate('/grievances?status=In Progress')}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Successfully Resolved"
            value={resolved}
            icon="bi-check2-circle"
            bgColor="#ecfdf5"
            iconColor="#059669"
            onClick={() => navigate('/grievances?status=Resolved')}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Grievances Table */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-clock-history me-2 text-gov-accent"></i>
                My Recent Grievances
              </h5>
              <Link to="/grievances" className="small text-decoration-none fw-semibold">
                View All ({myGrievances.length}) <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            <div className="card-body p-0">
              {myGrievances.length === 0 ? (
                <EmptyState
                  title="No Grievances Registered Yet"
                  description="You have not submitted any complaints. Use the button below to register an issue with the civic authorities."
                  actionButton={
                    <Link to="/grievances/new" className="btn btn-primary btn-sm">
                      <i className="bi bi-plus-lg me-1"></i> Register Your First Grievance
                    </Link>
                  }
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Subject & Category</th>
                        <th>Submitted</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myGrievances.slice(0, 5).map((g) => (
                        <tr key={g.id}>
                          <td>
                            <Link to={`/grievances/${g.id}`} className="fw-bold text-decoration-none">
                              {g.complaintId}
                            </Link>
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>
                              {g.title}
                            </div>
                            <div className="small text-muted">{g.categoryId || getDeptName(g.departmentId)}</div>
                          </td>
                          <td className="small text-muted">{formatDate(g.submittedAt)}</td>
                          <td>
                            <PriorityBadge priority={g.priority} />
                          </td>
                          <td>
                            <StatusBadge status={g.status} />
                          </td>
                          <td className="text-end">
                            <Link to={`/grievances/${g.id}`} className="btn btn-sm btn-outline-primary">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Distribution & Notifications Box */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                Status Overview
              </h5>
            </div>
            <div className="card-body">
              {total > 0 ? (
                <ReportChart type="doughnut" data={chartData} height={200} />
              ) : (
                <div className="text-center py-4 text-muted small">
                  No data to display in chart
                </div>
              )}
            </div>
          </div>

          {/* Quick Notifications Widget */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-bell-fill me-2 text-warning"></i>
                Latest Updates
              </h5>
              <Link to="/notifications" className="small text-muted text-decoration-none">
                All
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {userNotifs.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No notifications</div>
                ) : (
                  userNotifs.slice(0, 3).map((n) => (
                    <div key={n.id} className="list-group-item p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong className="small text-dark">{n.title}</strong>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="small text-secondary mb-0" style={{ fontSize: '0.8rem' }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

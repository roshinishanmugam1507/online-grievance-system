import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { calculateGrievanceMetrics } from '../../utils/reportUtils';
import { exportToCSV } from '../../utils/exportCSV';
import { PageHeader, StatCard } from '../../components/common/CommonComponents';
import ReportChart from '../../components/reports/ReportChart';
import { formatDate } from '../../utils/formatters';

export const ReportsPage = () => {
  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);
  const feedbacks = useSelector((state) => state.feedback.items);

  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | 'month' | 'year'

  // Apply Date Filtering
  const filteredGrievances = useMemo(() => {
    if (dateFilter === 'all') return allGrievances;

    const now = new Date();
    return allGrievances.filter((g) => {
      const gDate = new Date(g.submittedAt);
      if (dateFilter === 'today') {
        return gDate.toDateString() === now.toDateString();
      }
      if (dateFilter === '7days') {
        const diff = (now - gDate) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (dateFilter === 'month') {
        return gDate.getMonth() === now.getMonth() && gDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'year') {
        return gDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [allGrievances, dateFilter]);

  const metrics = useMemo(() => {
    return calculateGrievanceMetrics(filteredGrievances, departments, officers, feedbacks);
  }, [filteredGrievances, departments, officers, feedbacks]);

  // Priority Chart Data
  const priorityChartData = {
    labels: ['Urgent', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          filteredGrievances.filter((g) => g.priority === 'Urgent').length,
          filteredGrievances.filter((g) => g.priority === 'High').length,
          filteredGrievances.filter((g) => g.priority === 'Medium').length,
          filteredGrievances.filter((g) => g.priority === 'Low').length
        ],
        backgroundColor: ['#dc2626', '#d97706', '#0284c7', '#059669']
      }
    ]
  };

  // Department Performance Chart Data
  const deptPerformanceChartData = {
    labels: metrics.departmentStats.map((d) => d.name.split(' ')[0]),
    datasets: [
      {
        label: 'Resolved Grievances',
        data: metrics.departmentStats.map((d) => d.resolved),
        backgroundColor: '#10b981'
      },
      {
        label: 'Pending Redressal',
        data: metrics.departmentStats.map((d) => d.pending),
        backgroundColor: '#f59e0b'
      }
    ]
  };

  // CSV Export
  const handleExportCSV = () => {
    const reportData = metrics.departmentStats.map((d) => ({
      Department: d.name,
      TotalComplaints: d.total,
      Resolved: d.resolved,
      Pending: d.pending,
      ResolutionRate: `${d.rate}%`
    }));
    exportToCSV(reportData, `PGRS_Executive_Report_${Date.now()}.csv`);
  };

  return (
    <div>
      {/* Header with Print & Export */}
      <PageHeader
        title="Public Redressal Analytics & Performance Reports"
        subtitle="Comprehensive administrative metrics, department performance audits, and SLA compliance data."
        action={
          <div className="d-flex gap-2 no-print">
            <button className="btn btn-sm btn-outline-success" onClick={handleExportCSV}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export Report (CSV)
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Print / Save PDF
            </button>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <div className="card shadow-sm border-0 mb-4 no-print">
        <div className="card-body p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <span className="small fw-bold text-gov-primary">
            <i className="bi bi-funnel me-1"></i> Filter Reporting Period:
          </span>
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDateFilter('all')}
            >
              All Time
            </button>
            <button
              className={`btn ${dateFilter === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDateFilter('month')}
            >
              This Month
            </button>
            <button
              className={`btn ${dateFilter === '7days' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDateFilter('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`btn ${dateFilter === 'year' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDateFilter('year')}
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Print Document Title */}
      <div className="d-none print-header mb-4">
        <h3 className="fw-bold">Online Public Grievance Redressal System (OPGRS) - Executive Report</h3>
        <p className="small text-muted">Generated on {formatDate(new Date().toISOString())}</p>
      </div>

      {/* Executive KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Total Logged"
            value={metrics.total}
            icon="bi-files"
            bgColor="#eff6ff"
            iconColor="#1d4ed8"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Resolved"
            value={metrics.resolved}
            icon="bi-check-all"
            bgColor="#ecfdf5"
            iconColor="#059669"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Pending Cases"
            value={metrics.pending}
            icon="bi-hourglass-split"
            bgColor="#fffbeb"
            iconColor="#b45309"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Resolution Rate"
            value={`${metrics.resolutionRate}%`}
            icon="bi-graph-up"
            bgColor="#f0fdf4"
            iconColor="#16a34a"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Avg SLA Days"
            value={`${metrics.avgResolutionDays}d`}
            subtitle="Avg resolution turnaround"
            icon="bi-clock-history"
            bgColor="#f8fafc"
            iconColor="#475569"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatCard
            title="Citizen Rating"
            value={`${metrics.avgRating} / 5`}
            icon="bi-star-fill"
            bgColor="#fffbeb"
            iconColor="#d97706"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-bar-chart-line-fill me-2 text-primary"></i>
                Departmental Caseload & Resolution Output
              </h5>
            </div>
            <div className="card-body">
              <ReportChart type="bar" data={deptPerformanceChartData} height={260} />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="h6 fw-bold mb-0 text-gov-primary">
                <i className="bi bi-pie-chart-fill me-2 text-gov-accent"></i>
                Urgency & Priority Classification
              </h5>
            </div>
            <div className="card-body">
              <ReportChart type="pie" data={priorityChartData} height={260} />
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="h6 fw-bold mb-0 text-gov-primary">
            <i className="bi bi-table me-2 text-gov-accent"></i>
            Detailed Department Performance Matrix
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Complaints</th>
                  <th>Resolved Cases</th>
                  <th>Pending Cases</th>
                  <th>Resolution Rate (%)</th>
                  <th>Performance Index</th>
                </tr>
              </thead>
              <tbody>
                {metrics.departmentStats.map((d) => {
                  const rateNum = Number(d.rate);
                  let rateBadgeClass = 'bg-success';
                  if (rateNum < 40) rateBadgeClass = 'bg-danger';
                  else if (rateNum < 70) rateBadgeClass = 'bg-warning text-dark';

                  return (
                    <tr key={d.id}>
                      <td>
                        <strong className="text-gov-primary">{d.name}</strong>
                      </td>
                      <td><span className="badge bg-light text-dark border">{d.total}</span></td>
                      <td><span className="badge bg-success bg-opacity-10 text-success fw-bold">{d.resolved}</span></td>
                      <td><span className="badge bg-warning bg-opacity-10 text-warning fw-bold">{d.pending}</span></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${d.rate}%` }}
                            ></div>
                          </div>
                          <span className="small fw-bold">{d.rate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${rateBadgeClass} small`}>
                          {rateNum >= 70 ? 'Excellent' : rateNum >= 40 ? 'Satisfactory' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

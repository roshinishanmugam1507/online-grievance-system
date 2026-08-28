import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const grievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);

  const totalComplaints = grievances.length;
  const resolvedComplaints = grievances.filter((g) => g.status === 'Resolved').length;
  const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(0) : '0';

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track?id=${encodeURIComponent(searchId.trim().toUpperCase())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gov-gradient py-5 text-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark fw-bold mb-3 px-3 py-2">
                <i className="bi bi-patch-check-fill me-1"></i> Official Grievance Redressal Portal
              </span>
              <h1 className="display-5 fw-bold text-white mb-3">
                Your Voice, Our Priority: Transparent Public Redressal
              </h1>
              <p className="lead text-white-50 mb-4">
                Register municipal and public-service complaints directly with local administration departments. Track real-time resolution timeline with guaranteed administrative accountability.
              </p>

              {/* Instant Complaint Tracker Form */}
              <div className="card shadow-lg border-0 p-3 bg-white text-dark rounded-3" style={{ maxWidth: '580px' }}>
                <form onSubmit={handleTrackSubmit}>
                  <label className="form-label fw-bold text-gov-primary small">
                    <i className="bi bi-search me-1 text-warning"></i> Track Grievance Status by Complaint ID
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. GRV-2026-000001"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-accent px-4 fw-semibold">
                      Track Now <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                  <div className="form-text small text-muted mt-2">
                    Try sample ID: <strong>GRV-2026-000001</strong> or <strong>GRV-2026-000002</strong>
                  </div>
                </form>
              </div>

              <div className="d-flex gap-3 mt-4">
                <Link to="/grievances/new" className="btn btn-warning btn-lg fw-bold px-4">
                  <i className="bi bi-plus-circle-fill me-2"></i> Submit a Grievance
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Citizen Login
                </Link>
              </div>
            </div>

            {/* Hero Side Infographics / Live Counters */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-lg bg-white p-4 rounded-4 text-dark">
                <h5 className="fw-bold text-gov-primary mb-3">
                  <i className="bi bi-graph-up-arrow text-success me-2"></i>
                  Live Resolution Statistics
                </h5>
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="h2 fw-bold text-gov-primary mb-0">{totalComplaints}</div>
                      <div className="small text-muted text-uppercase fw-semibold">Total Grievances</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-success bg-opacity-10 rounded-3">
                      <div className="h2 fw-bold text-success mb-0">{resolvedComplaints}</div>
                      <div className="small text-muted text-uppercase fw-semibold">Resolved Cases</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                      <div className="h2 fw-bold text-warning mb-0">{resolutionRate}%</div>
                      <div className="small text-muted text-uppercase fw-semibold">Resolution Rate</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-info bg-opacity-10 rounded-3">
                      <div className="h2 fw-bold text-info mb-0">{departments.length}</div>
                      <div className="small text-muted text-uppercase fw-semibold">Active Depts</div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-4 mb-0 py-2 small d-flex align-items-center">
                  <i className="bi bi-clock-history me-2 fs-5"></i>
                  <span>Average grievance redressal cycle: <strong>2.4 working days</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-gov-accent fw-bold text-uppercase small">Step-by-Step Workflow</span>
            <h2 className="fw-bold text-gov-primary mt-1">How Grievance Redressal Works</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Four simple steps ensure your issue is escalated to the designated municipal officer and resolved.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 bg-light text-center">
                <div className="rounded-circle bg-gov-primary text-white mx-auto d-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                  1
                </div>
                <h5 className="fw-bold text-dark mb-2">Register Complaint</h5>
                <p className="small text-muted mb-0">
                  Select department, describe issue, attach photos, and receive unique GRV tracking ID.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 bg-light text-center">
                <div className="rounded-circle bg-info text-white mx-auto d-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                  2
                </div>
                <h5 className="fw-bold text-dark mb-2">Admin Review & Assign</h5>
                <p className="small text-muted mb-0">
                  Central administration verifies validity and assigns to designated field officer.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 bg-light text-center">
                <div className="rounded-circle bg-warning text-white mx-auto d-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                  3
                </div>
                <h5 className="fw-bold text-dark mb-2">Field Officer Action</h5>
                <p className="small text-muted mb-0">
                  Officer inspects site, executes repairs, and logs progress remarks on the portal.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 p-4 border-0 bg-light text-center">
                <div className="rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                  4
                </div>
                <h5 className="fw-bold text-dark mb-2">Redressal & Rating</h5>
                <p className="small text-muted mb-0">
                  Citizen confirms resolution quality and rates the department service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Overview */}
      <section className="py-5 bg-light border-top">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-gov-accent fw-bold text-uppercase small">Municipal Wings</span>
              <h2 className="fw-bold text-gov-primary mt-1">Covered Public Service Sectors</h2>
            </div>
            <Link to="/register" className="btn btn-outline-primary btn-sm">
              Register to File Complaint <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-3">
            {departments.slice(0, 6).map((dept) => (
              <div key={dept.id} className="col-md-4">
                <div className="card h-100 p-3 border shadow-sm">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="rounded p-2 bg-primary bg-opacity-10 text-gov-primary">
                      <i className="bi bi-building-check fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-gov-primary">{dept.name}</h6>
                      <span className="badge bg-light text-secondary border small">{dept.code}</span>
                    </div>
                  </div>
                  <p className="small text-muted mb-2">{dept.description}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center small text-muted pt-2 border-top">
                    <span><i className="bi bi-person me-1"></i> {dept.head}</span>
                    <span className="text-success fw-semibold"><i className="bi bi-check-circle me-1"></i> Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

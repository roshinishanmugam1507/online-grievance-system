import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../features/tracking/trackingAndMiscSlices';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { PageHeader, EmptyState } from '../../components/common/CommonComponents';
import { formatDate } from '../../utils/formatters';

export const UsersPage = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.items);
  const grievances = useSelector(selectAllGrievances);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const citizenUsers = useMemo(() => {
    return users.filter((u) => u.role === 'citizen');
  }, [users]);

  const filteredCitizens = useMemo(() => {
    if (!searchTerm.trim()) return citizenUsers;
    const q = searchTerm.toLowerCase().trim();
    return citizenUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q))
    );
  }, [citizenUsers, searchTerm]);

  return (
    <div>
      <PageHeader
        title="Registered Citizen Directory"
        subtitle={`Total registered citizens on OPGRS: ${citizenUsers.length}. Review citizen profiles and activity.`}
      />

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
                  placeholder="Search by citizen name, email, phone, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {filteredCitizens.length === 0 ? (
            <EmptyState
              title="No Citizens Found"
              description="No registered citizens match the search query."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Citizen Profile</th>
                    <th>Contact Phone</th>
                    <th>Residential Address</th>
                    <th>Total Complaints</th>
                    <th>Status</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCitizens.map((c) => {
                    const userComplaints = grievances.filter((g) => g.userId === c.id);
                    const resolvedCount = userComplaints.filter((g) => g.status === 'Resolved').length;

                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-gov-primary text-white d-flex align-items-center justify-content-center fw-bold small"
                              style={{ width: '36px', height: '36px' }}
                            >
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{c.name}</div>
                              <div className="small text-muted">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="small text-dark">{c.phone || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="small text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                            {c.address || 'Address on record'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark border">
                              {userComplaints.length} Total
                            </span>
                            {resolvedCount > 0 && (
                              <span className="badge bg-success bg-opacity-10 text-success">
                                {resolvedCount} Resolved
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-success small">Active</span>
                        </td>
                        <td>
                          <span className="small text-muted">{formatDate(c.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllOfficers, addOfficer, updateOfficer } from '../../features/officers/officerSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { PageHeader, EmptyState } from '../../components/common/CommonComponents';

export const OfficersPage = () => {
  const dispatch = useDispatch();
  const officers = useSelector(selectAllOfficers);
  const departments = useSelector(selectAllDepartments);
  const grievances = useSelector(selectAllGrievances);

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    zone: '',
    status: 'Active'
  });

  const filteredOfficers = useMemo(() => {
    let list = [...officers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.designation.toLowerCase().includes(q) ||
          (o.zone && o.zone.toLowerCase().includes(q))
      );
    }

    if (deptFilter !== 'All') {
      list = list.filter((o) => o.departmentId === deptFilter);
    }

    if (statusFilter !== 'All') {
      list = list.filter((o) => o.status === statusFilter);
    }

    return list;
  }, [officers, searchTerm, deptFilter, statusFilter]);

  const getDept = (id) => departments.find((d) => d.id === id);

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      designation: 'Junior Engineer',
      zone: 'Zone 8 - Anna Nagar',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name,
      email: officer.email,
      phone: officer.phone,
      departmentId: officer.departmentId,
      designation: officer.designation,
      zone: officer.zone || '',
      status: officer.status
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (officer) => {
    const newStatus = officer.status === 'Active' ? 'Inactive' : 'Active';
    await dispatch(
      updateOfficer({
        id: officer.id,
        data: { status: newStatus }
      })
    );
    dispatch(
      showToast({
        title: 'Officer Status Updated',
        message: `${officer.name} is now ${newStatus}.`,
        type: 'info'
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingOfficer) {
      await dispatch(
        updateOfficer({
          id: editingOfficer.id,
          data: formData
        })
      );
      dispatch(
        showToast({
          title: 'Officer Updated',
          message: `${formData.name} record updated successfully.`,
          type: 'success'
        })
      );
    } else {
      await dispatch(addOfficer(formData));
      dispatch(
        showToast({
          title: 'Officer Registered',
          message: `${formData.name} added to departmental roster.`,
          type: 'success'
        })
      );
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Field Officer Directory"
        subtitle="Manage government engineers and municipal field officers assigned to grievance redressal."
        action={
          <button className="btn btn-accent btn-sm" onClick={handleOpenAdd}>
            <i className="bi bi-person-plus-fill me-1"></i> Add New Officer
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-md-4">
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

            <div className="col-sm-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Officers</option>
                <option value="Inactive">Inactive Officers</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Officers Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {filteredOfficers.length === 0 ? (
            <EmptyState
              title="No Officers Found"
              description="No field officers match the selected criteria."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Officer Name & Role</th>
                    <th>Department & Zone</th>
                    <th>Contact Info</th>
                    <th>Assigned Cases</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.map((o) => {
                    const deptObj = getDept(o.departmentId);
                    const officerGrievances = grievances.filter((g) => g.officerId === o.id);
                    const activeCount = officerGrievances.filter((g) =>
                      ['Assigned', 'In Progress'].includes(g.status)
                    ).length;
                    const resolvedCount = officerGrievances.filter((g) => g.status === 'Resolved').length;

                    return (
                      <tr key={o.id}>
                        <td>
                          <div className="fw-bold text-dark">{o.name}</div>
                          <div className="small text-muted">{o.designation}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-gov-primary small">{deptObj?.name || 'Unassigned'}</div>
                          <div className="small text-muted">{o.zone || 'Central Zone'}</div>
                        </td>
                        <td>
                          <div className="small text-dark">{o.email}</div>
                          <div className="small text-muted">{o.phone}</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning text-dark" title="Active pending cases">
                              {activeCount} Active
                            </span>
                            <span className="badge bg-success bg-opacity-10 text-success fw-bold" title="Resolved cases">
                              {resolvedCount} Resolved
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${o.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Officer"
                              onClick={() => handleOpenEdit(o)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${
                                o.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'
                              }`}
                              title={o.status === 'Active' ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggleStatus(o)}
                            >
                              <i className={`bi ${o.status === 'Active' ? 'bi-person-slash' : 'bi-person-check'}`}></i>
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
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-gov-primary text-white">
                  <h5 className="modal-title fs-6 fw-bold">
                    {editingOfficer ? 'Edit Field Officer' : 'Register New Officer'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label">Full Officer Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        required
                      >
                        <option value="">-- Select --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Official Email *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Contact Phone *</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-8">
                      <label className="form-label">Assigned Zone / Ward</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.zone}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        placeholder="e.g. Zone 8 - Anna Nagar"
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">
                    {editingOfficer ? 'Update Officer' : 'Add Officer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficersPage;

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllDepartments,
  addDepartment,
  updateDepartment
} from '../../features/departments/departmentSlice';
import { selectAllOfficers } from '../../features/officers/officerSlice';
import { selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { PageHeader, EmptyState } from '../../components/common/CommonComponents';

export const DepartmentsPage = () => {
  const dispatch = useDispatch();
  const departments = useSelector(selectAllDepartments);
  const officers = useSelector(selectAllOfficers);
  const grievances = useSelector(selectAllGrievances);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  const filteredDepts = useMemo(() => {
    if (!searchTerm.trim()) return departments;
    const q = searchTerm.toLowerCase().trim();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q)
    );
  }, [departments, searchTerm]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      head: '',
      email: '',
      phone: '',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      head: dept.head,
      email: dept.email,
      phone: dept.phone,
      status: dept.status
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    await dispatch(
      updateDepartment({
        id: dept.id,
        data: { status: newStatus }
      })
    );
    dispatch(
      showToast({
        title: 'Status Updated',
        message: `${dept.name} is now ${newStatus}.`,
        type: 'info'
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingDept) {
      await dispatch(
        updateDepartment({
          id: editingDept.id,
          data: formData
        })
      );
      dispatch(
        showToast({
          title: 'Department Updated',
          message: `${formData.name} updated successfully.`,
          type: 'success'
        })
      );
    } else {
      await dispatch(addDepartment(formData));
      dispatch(
        showToast({
          title: 'Department Created',
          message: `${formData.name} added to portal directory.`,
          type: 'success'
        })
      );
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Department Administration"
        subtitle="Manage municipal public service departments, department heads, and jurisdictional scopes."
        action={
          <button className="btn btn-accent btn-sm" onClick={handleOpenAdd}>
            <i className="bi bi-plus-circle-fill me-1"></i> Add Department
          </button>
        }
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
                  placeholder="Search department name, code, or head..."
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
          {filteredDepts.length === 0 ? (
            <EmptyState
              title="No Departments Found"
              description="No departments matching your search query."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Department Name & Code</th>
                    <th>Department Head & Contact</th>
                    <th>Active Officers</th>
                    <th>Open Grievances</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.map((d) => {
                    const deptOfficersCount = officers.filter(
                      (o) => o.departmentId === d.id && o.status === 'Active'
                    ).length;
                    const openGrievancesCount = grievances.filter(
                      (g) =>
                        g.departmentId === d.id &&
                        ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(g.status)
                    ).length;

                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="fw-bold text-gov-primary">{d.name}</div>
                          <div className="small text-muted">{d.description}</div>
                          <span className="badge bg-light text-secondary border mt-1 small">
                            Code: {d.code}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark small">{d.head}</div>
                          <div className="small text-muted">{d.email} • {d.phone}</div>
                        </td>
                        <td>
                          <span className="badge bg-info bg-opacity-10 text-info fw-bold">
                            <i className="bi bi-people-fill me-1"></i> {deptOfficersCount} Officers
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              openGrievancesCount > 0 ? 'bg-warning text-dark' : 'bg-light text-muted border'
                            }`}
                          >
                            {openGrievancesCount} Open
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              d.status === 'Active' ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Department"
                              onClick={() => handleOpenEdit(d)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${
                                d.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'
                              }`}
                              title={d.status === 'Active' ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggleStatus(d)}
                            >
                              <i className={`bi ${d.status === 'Active' ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
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
                    {editingDept ? 'Edit Department' : 'Add New Department'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body py-3">
                  <div className="row g-2 mb-3">
                    <div className="col-8">
                      <label className="form-label">Department Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label">Code *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description / Scope *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Department Head / Officer *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.head}
                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-8">
                      <label className="form-label">Department Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    {editingDept ? 'Update Department' : 'Save Department'}
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

export default DepartmentsPage;

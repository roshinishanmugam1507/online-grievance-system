import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { submitGrievance, selectAllGrievances } from '../../features/grievances/grievanceSlice';
import { selectAllDepartments } from '../../features/departments/departmentSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { generateComplaintId } from '../../utils/idGenerator';
import { validateGrievanceForm } from '../../utils/validation';

export const SubmitGrievancePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const allGrievances = useSelector(selectAllGrievances);
  const departments = useSelector(selectAllDepartments);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    departmentId: '',
    location: '',
    description: '',
    priority: 'Medium'
  });

  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [submittedGrievance, setSubmittedGrievance] = useState(null);

  // Predefined Categories mapped to standard departments
  const CATEGORIES = [
    { label: 'Roads, Potholes & Footpaths', deptName: 'Roads & Transport' },
    { label: 'Drinking Water & Sewerage Leakage', deptName: 'Water Supply & Sewerage' },
    { label: 'Power Cut, Hanging Wire & Transformers', deptName: 'Electricity Board (TNEB)' },
    { label: 'Garbage Dump & Waste Sanitation', deptName: 'Solid Waste & Sanitation' },
    { label: 'Mosquito Breeding & Public Health', deptName: 'Public Health & Malaria Control' },
    { label: 'Faulty Streetlights & Dark Corridors', deptName: 'Street Lighting & Electricals' },
    { label: 'Choked Stormwater Drains & Canals', deptName: 'Storm Water Drainage' },
    { label: 'Other Civic & Municipal Issues', deptName: '' }
  ];

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    const matchedCategory = CATEGORIES.find((c) => c.label === selectedCat);

    let mappedDeptId = '';
    if (matchedCategory && matchedCategory.deptName) {
      const foundDept = departments.find((d) => d.name.toLowerCase().includes(matchedCategory.deptName.toLowerCase()));
      if (foundDept) {
        mappedDeptId = foundDept.id;
      }
    }

    setFormData((prev) => ({
      ...prev,
      categoryId: selectedCat,
      departmentId: mappedDeptId || prev.departmentId
    }));

    if (formErrors.categoryId) {
      setFormErrors((prev) => ({ ...prev, categoryId: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle file attachment via FileReader API
  const handleFileChange = (e) => {
    setAttachmentError('');
    const file = e.target.files[0];
    if (!file) {
      setAttachment(null);
      return;
    }

    // Validate size (max 2MB for safe localStorage)
    if (file.size > 2 * 1024 * 1024) {
      setAttachmentError('File size exceeds 2MB limit. Please upload a smaller photo or document.');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result
      });
    };
    reader.onerror = () => {
      setAttachmentError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateGrievanceForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintId = generateComplaintId(allGrievances);

      const payload = {
        complaintId,
        userId: user?.id,
        citizenName: user?.name || 'Citizen',
        citizenEmail: user?.email,
        citizenPhone: user?.phone,
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        departmentId: formData.departmentId || null,
        officerId: null,
        location: formData.location.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'Submitted',
        attachment: attachment,
        adminRemarks: null,
        resolutionDetails: null
      };

      const resultAction = await dispatch(submitGrievance(payload));
      if (submitGrievance.fulfilled.match(resultAction)) {
        setSubmittedGrievance(resultAction.payload);
        dispatch(
          showToast({
            title: 'Grievance Registered',
            message: `Your complaint has been submitted with ID: ${complaintId}`,
            type: 'success'
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          title: 'Submission Error',
          message: 'Failed to submit grievance. Please check your input.',
          type: 'danger'
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="h4 fw-bold text-gov-primary mb-1">
            <i className="bi bi-pencil-square me-2 text-gov-accent"></i>
            Register Public Grievance
          </h2>
          <p className="text-muted small mb-0">
            Submit your civic complaint for official investigation and prompt redressal.
          </p>
        </div>
        <Link to="/grievances" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to My Grievances
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-gov-primary text-white py-3 px-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-medical fs-5 text-warning"></i>
                <span className="fw-semibold">Official Citizen Complaint Form</span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <div className="alert alert-info py-2 px-3 small mb-4 d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>
                  Please provide accurate location details and describe the civic problem clearly to assist field officers in resolving it quickly.
                </div>
              </div>

              <form onSubmit={handleFormSubmit}>
                {/* 1. Title */}
                <div className="mb-4">
                  <label className="form-label">
                    Complaint Subject / Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                    placeholder="e.g. Broken water pipeline flooding street opposite school"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                  <div className="form-text small text-muted">
                    Keep it short, specific, and clear (5 to 150 characters).
                  </div>
                </div>

                {/* 2. Category & Department */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">
                      Grievance Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.categoryId ? 'is-invalid' : ''}`}
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">-- Select Grievance Category --</option>
                      {CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && <div className="invalid-feedback">{formErrors.categoryId}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Target Municipal Department</label>
                    <select
                      name="departmentId"
                      className="form-select"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Automatically Routed by Category --</option>
                      {departments.filter(d => d.status === 'Active').map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                    <div className="form-text small text-muted">
                      Admin will review and assign to the appropriate wing.
                    </div>
                  </div>
                </div>

                {/* 3. Location & Priority */}
                <div className="row g-3 mb-4">
                  <div className="col-md-8">
                    <label className="form-label">
                      Exact Location & Landmark <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g. Near Pillayar Temple Arch, 2nd Cross, Anna Nagar West"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Urgency / Priority Request</label>
                    <select
                      name="priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low - Normal Civic Issue</option>
                      <option value="Medium">Medium - Standard Request</option>
                      <option value="High">High - Serious Inconvenience</option>
                      <option value="Urgent">Urgent - Public Safety Hazard</option>
                    </select>
                  </div>
                </div>

                {/* 4. Description */}
                <div className="mb-4">
                  <label className="form-label">
                    Detailed Complaint Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                    placeholder="Describe what happened, how long the issue has persisted, and how it impacts residents..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                  <div className="form-text small text-muted">
                    Minimum 20 characters required.
                  </div>
                </div>

                {/* 5. Supporting Document Attachment (FileReader) */}
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <label className="form-label fw-bold">
                    <i className="bi bi-paperclip me-1 text-primary"></i> Supporting Evidence (Photo / PDF Document)
                  </label>
                  <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                  />
                  {attachmentError && (
                    <div className="text-danger small mb-2">{attachmentError}</div>
                  )}
                  <div className="form-text small text-muted">
                    Allowed formats: <code>JPG, PNG, PDF</code>. Maximum file size: 2MB. Stored in the local JSON storage system.
                  </div>

                  {attachment && (
                    <div className="mt-3 p-2 bg-white rounded border d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span className="small fw-semibold">{attachment.name}</span>
                        <span className="badge bg-light text-secondary border">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setAttachment(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate('/citizen/dashboard')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent px-5 fw-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i> Submit Grievance
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {submittedGrievance && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 1080 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg text-center p-4">
              <div className="rounded-circle bg-success bg-opacity-10 text-success mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-check-circle-fill fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">Grievance Registered Successfully!</h4>
              <p className="text-muted small mb-3">
                Your complaint has been logged and assigned a unique tracking number.
              </p>

              <div className="p-3 bg-light rounded-3 border mb-4">
                <div className="text-muted small text-uppercase fw-semibold">Public Tracking ID</div>
                <div className="h3 fw-bold text-gov-primary font-monospace mt-1 mb-0">
                  {submittedGrievance.complaintId}
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link
                  to={`/grievances/${submittedGrievance.id}`}
                  className="btn btn-primary fw-semibold py-2"
                >
                  <i className="bi bi-eye me-2"></i> View Grievance Details
                </Link>
                <Link
                  to="/citizen/dashboard"
                  className="btn btn-outline-secondary py-2"
                >
                  Back to Citizen Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitGrievancePage;

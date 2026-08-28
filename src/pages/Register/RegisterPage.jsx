import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import { validateRegistrationForm } from '../../utils/validation';

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const authError = useSelector((state) => state.auth.error);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const { isValid, errors } = validateRegistrationForm(formData);

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const resultAction = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(resultAction)) {
        dispatch(
          showToast({
            title: 'Registration Successful',
            message: 'Your citizen account has been created. Welcome to OPGRS!',
            type: 'success'
          })
        );
        navigate('/citizen/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-9 col-lg-7">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-gov-gradient p-4 text-white text-center">
            <h4 className="fw-bold mb-1">Citizen Registration</h4>
            <p className="small text-white-50 mb-0">Create an account to submit & track public grievances</p>
          </div>

          <div className="card-body p-4 p-md-5">
            {authError && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 small mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Ramesh Krishnan"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile Number *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted small">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {formErrors.phone && <div className="text-danger small mt-1">{formErrors.phone}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. citizen@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Residential Address *</label>
                <textarea
                  name="address"
                  rows="2"
                  className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                  placeholder="Door No, Street Name, Area/Zone, City, Pincode"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
                {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {formErrors.password && <div className="text-danger small mt-1">{formErrors.password}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill me-2"></i> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="small text-muted">Already registered? </span>
              <Link to="/login" className="small fw-semibold text-gov-primary">
                Sign In Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

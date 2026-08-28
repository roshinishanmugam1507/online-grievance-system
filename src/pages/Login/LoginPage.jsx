import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const authError = useSelector((state) => state.auth.error);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        dispatch(
          showToast({
            title: 'Login Successful',
            message: `Welcome back, ${user.name}!`,
            type: 'success'
          })
        );

        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'officer') {
          navigate('/officer/dashboard', { replace: true });
        } else {
          navigate('/citizen/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(clearAuthError());
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Card Top Strip */}
          <div className="bg-gov-gradient p-4 text-white text-center">
            <h4 className="fw-bold mb-1">Sign In to OPGRS</h4>
            <p className="small text-white-50 mb-0">Online Public Grievance Redressal Portal</p>
          </div>

          <div className="card-body p-4 p-md-5">
            {authError && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 small mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="small text-muted text-decoration-none">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="mb-4 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberCheck"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label small text-muted" htmlFor="rememberCheck">
                  Remember my session on this device
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="small text-muted">Don't have an account yet? </span>
              <Link to="/register" className="small fw-semibold text-gov-primary">
                Register as Citizen
              </Link>
            </div>

            {/* Quick Demo Accounts Selection Box */}
            <div className="mt-4 pt-3 border-top bg-light p-3 rounded-3">
              <div className="small fw-bold text-dark mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                One-Click Demo Credentials:
              </div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center"
                  onClick={() => handleDemoFill('citizen@example.com', 'citizen123')}
                >
                  <span><i className="bi bi-person me-1"></i> Citizen Demo</span>
                  <span className="badge bg-primary">citizen@example.com</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm text-start d-flex justify-content-between align-items-center"
                  onClick={() => handleDemoFill('admin@grievance.gov.demo', 'admin123')}
                >
                  <span><i className="bi bi-shield-lock me-1"></i> Admin Demo</span>
                  <span className="badge bg-dark">admin@grievance.gov.demo</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center"
                  onClick={() => handleDemoFill('officer@grievance.gov.demo', 'officer123')}
                >
                  <span><i className="bi bi-briefcase me-1"></i> Officer Demo</span>
                  <span className="badge bg-secondary">officer@grievance.gov.demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

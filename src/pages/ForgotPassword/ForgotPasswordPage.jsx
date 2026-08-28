import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-gov-gradient p-4 text-white text-center">
            <h4 className="fw-bold mb-1">Reset Password</h4>
            <p className="small text-white-50 mb-0">Academic demonstration of password recovery</p>
          </div>

          <div className="card-body p-4 p-md-5">
            {submitted ? (
              <div className="text-center py-3">
                <div className="rounded-circle bg-success bg-opacity-10 text-success mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-check-circle-fill fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Instructions Sent</h5>
                <p className="text-muted small mb-4">
                  For demonstration purposes, a mock reset link has been generated for <strong>{email}</strong>. In this demo, you can use the default demo password: <code>citizen123</code> / <code>admin123</code> / <code>officer123</code>.
                </p>
                <Link to="/login" className="btn btn-primary w-100 py-2">
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted small mb-4">
                  Enter your registered email address and we will provide mock recovery instructions.
                </p>

                <div className="mb-4">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. citizen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3">
                  Send Recovery Link
                </button>

                <div className="text-center">
                  <Link to="/login" className="small text-decoration-none text-muted">
                    <i className="bi bi-arrow-left me-1"></i> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PageHeader } from '../../components/common/CommonComponents';
import { showToast } from '../../features/tracking/trackingAndMiscSlices';
import storageService from '../../services/storageService';
import { formatDate } from '../../utils/formatters';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);

    try {
      await storageService.updateUser(user.id, {
        name,
        phone,
        address
      });

      dispatch(
        showToast({
          title: 'Profile Updated',
          message: 'Your profile details have been saved to local JSON storage.',
          type: 'success'
        })
      );
    } catch (err) {
      console.error('Failed to update profile:', err);
      dispatch(
        showToast({
          title: 'Update Error',
          message: err.message || 'Failed to update profile in local JSON storage.',
          type: 'danger'
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Profile & Settings"
        subtitle="Manage your personal contact details and review your role privileges on OPGRS."
      />

      <div className="row g-4 justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            <div className="bg-gov-gradient p-4 text-white">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-white text-gov-primary d-flex align-items-center justify-content-center fw-bold fs-3 shadow"
                  style={{ width: '64px', height: '64px' }}
                >
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-0">{name || 'User Profile'}</h4>
                  <div className="small text-white-50">{user?.email}</div>
                  <span className="badge bg-warning text-dark mt-1 text-uppercase fw-bold">
                    {user?.role} Account
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleProfileSave}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Email Address (Immutable)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Account Created</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formatDate(user?.createdAt)}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Address / Jurisdiction</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={isSaving}>
                    <i className="bi bi-save me-1"></i> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

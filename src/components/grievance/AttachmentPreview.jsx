import React, { useState } from 'react';

export const AttachmentPreview = ({ attachment }) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!attachment) {
    return (
      <div className="text-muted small italic p-2 bg-light rounded">
        <i className="bi bi-paperclip me-1"></i> No attachment provided.
      </div>
    );
  }

  const isImage = attachment.type?.startsWith('image/') || attachment.dataUrl?.startsWith('data:image/');

  return (
    <div>
      <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
        <div
          className="rounded d-flex align-items-center justify-content-center bg-white border"
          style={{ width: '48px', height: '48px', flexShrink: 0 }}
        >
          <i className={`bi ${isImage ? 'bi-file-earmark-image text-primary' : 'bi-file-earmark-pdf text-danger'} fs-4`}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <div className="fw-semibold text-truncate small text-dark">{attachment.name || 'Supporting_Document'}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Attached Evidence'} • {attachment.type || 'Document'}
          </div>
        </div>
        {isImage && attachment.dataUrl ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setModalOpen(true)}
          >
            <i className="bi bi-eye me-1"></i> Preview
          </button>
        ) : (
          <a
            href={attachment.dataUrl || '#'}
            download={attachment.name || 'document'}
            className="btn btn-sm btn-outline-secondary"
            target="_blank"
            rel="noreferrer"
          >
            <i className="bi bi-download me-1"></i> View / Download
          </a>
        )}
      </div>

      {modalOpen && isImage && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1080 }}
          onClick={() => setModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fs-6 fw-bold">{attachment.name || 'Evidence Image Preview'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body text-center p-2">
                <img
                  src={attachment.dataUrl}
                  alt="Attachment Evidence"
                  className="img-fluid rounded"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentPreview;

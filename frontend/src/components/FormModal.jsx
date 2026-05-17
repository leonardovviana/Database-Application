import { useEffect, useRef, useState } from 'react';

export default function FormModal({ open, onClose, onSubmit, title, children, error, loading: externalLoading }) {
  const ref = useRef(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const isSubmitting = externalLoading || internalLoading;

  useEffect(() => {
    if (open && ref.current) {
      const modal = ref.current;
      const bsModal = new window.bootstrap.Modal(modal, { backdrop: 'static', keyboard: false });
      bsModal.show();
      modal.addEventListener('hidden.bs.modal', onClose, { once: true });
      return () => {
        try { bsModal.hide(); } catch (_) {}
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) setInternalLoading(false);
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    setInternalLoading(true);
    try {
      await onSubmit(e);
    } finally {
      setInternalLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" disabled={isSubmitting} onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}
              {children}
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i> Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

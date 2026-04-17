import React, { createContext, useContext, useState } from 'react';

const GlobalModalContext = createContext();

export const useGlobalModal = () => useContext(GlobalModalContext);

export const GlobalModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    confirmStyle: 'primary', // 'primary', 'danger'
    onConfirm: null,
  });

  const showModal = (options) => {
    setModalState({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'alert',
      confirmLabel: options.confirmLabel || 'OK',
      cancelLabel: options.cancelLabel || 'Cancel',
      confirmStyle: options.confirmStyle || 'primary',
      onConfirm: options.onConfirm || null,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) modalState.onConfirm();
    closeModal();
  };

  return (
    <GlobalModalContext.Provider value={{ showModal }}>
      {children}
      {modalState.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '2px solid var(--sage)',
            borderRadius: 'var(--radius)',
            padding: 32,
            width: '90%', maxWidth: 400,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
            animation: 'slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center'
          }}>
            {modalState.title && <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>{modalState.title}</div>}
            <div style={{ fontSize: 14, color: 'var(--stone)', marginBottom: 24, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {modalState.message}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {modalState.type === 'confirm' && (
                <button
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', color: 'var(--stone)', border: '1px solid var(--border)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {modalState.cancelLabel}
                </button>
              )}
              
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                  background: modalState.confirmStyle === 'danger' ? '#ef4444' : 'var(--sage)',
                  color: 'white', border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {modalState.confirmLabel}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes slideDownFade {
              from { opacity: 0; transform: translateY(-40px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </GlobalModalContext.Provider>
  );
};

import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && onClose && (
              <button style={closeButtonStyles} onClick={onClose}>
                &times;
              </button>
            )}
          </div>
        )}
        <div style={contentStyles}>{children}</div>
      </div>
    </div>
  );
}

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
};

const modalStyles: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  minWidth: '300px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #e0e0e0',
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
};

const closeButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0 8px',
  color: '#757575',
};

const contentStyles: React.CSSProperties = {
  padding: '20px',
};

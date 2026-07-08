import '../styles/partner-finder.css';

const ConfirmModal = ({ isOpen, title, message, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="partner-modal-backdrop">
      <div className="partner-modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="partner-card-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

import { useState } from 'react';
import '../styles/partner-finder.css';

const PartnerRequestCard = ({ request, onJoin }) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const getStatusLabel = () => {
    if (request.status === 'matched') return 'MATCHED';
    if (request.status === 'expired') return 'EXPIRED';
    if (request.status === 'closed') return 'CLOSED';
    if (request.status === 'pending') return 'WAITING FOR PARTNER';
    return 'OPEN';
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const [year, month, day] = String(value).split('-');
    return `${month}/${day}/${year}`;
  };

  const formatTime = (value) => {
    if (!value) return '—';
    const [hourStr, minuteStr] = value.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className="partner-card">
      <div className="partner-card-head">
        <strong>{request.studentName}</strong>
        <span className={`partner-badge ${
          request.status === 'matched' ? 'badge-matched' :
          request.status === 'expired' ? 'badge-expired' :
          request.status === 'closed'  ? 'badge-closed'  :
          request.status === 'pending' ? 'badge-pending' : 'badge-open'
        }`}>{getStatusLabel()}</span>
      </div>

      <div className="partner-meta">
        <span>Reg no: {request.registrationNumber}</span>
        <span>Sport: {request.sport}</span>
        <span>Date: {formatDate(request.date)}</span>
        <span>Time: {formatTime(request.startTime)}</span>
        <span>Skill: {request.skillLevel}</span>
        <span>Venue: {request.venue || 'Any'}</span>
        <span>Gender: {request.genderPreference || 'Anyone'}</span>
      </div>

      <div className="partner-notes">{request.notes || 'No additional notes.'}</div>

      <div className="partner-card-actions">
        <button
          className="btn-primary"
          onClick={async () => {
            setFeedback('');
            setFeedbackError('');
            try {
              await onJoin(request.id);
              setFeedback('Join request sent.');
            } catch {
              setFeedbackError('Unable to join request');
            }
          }}
          disabled={request.isOwner || request.status !== 'open'}
        >
          Request to Join
        </button>
      </div>

      {feedback     && <div className="partner-inline-message success">{feedback}</div>}
      {feedbackError && <div className="partner-inline-message error">{feedbackError}</div>}
    </div>
  );
};

export default PartnerRequestCard;
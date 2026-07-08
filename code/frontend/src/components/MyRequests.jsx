import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import '../styles/partner-finder.css';

const MyRequests = ({
  requests, editingRequestId, editForm, onEditStart, onEditChange,
  onSave, onCancelEdit, onDelete, onClose, onOpenChat,
  activeChat, chatMessages, chatDraft, onChatDraftChange, onSendMessage
}) => {
  const [feedbackMap, setFeedbackMap] = useState({});
  const [detailsId, setDetailsId]     = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Format date — removes the T18:30:00.000Z part
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

  const isSessionExpired = (date, endTime, startTime) => {
    if (!date) return false;
    const dateOnly = String(date).substring(0, 10);
    let end;
    if (endTime && endTime !== 'null' && endTime !== '') {
      end = new Date(`${dateOnly}T${endTime}`);
    } else if (startTime) {
      // No end time set — assume a 2-hour session as a fallback
      end = new Date(`${dateOnly}T${startTime}`);
      end.setHours(end.getHours() + 2);
    } else {
      return false;
    }
    if (isNaN(end.getTime())) return false;
    // Add 5 minute grace period after end time
    end.setMinutes(end.getMinutes() + 5);
    return new Date() > end;
  };

  return (
    <section className="partner-panel pastel-yellow">
      <div className="partner-section-title">
        <h2>My Requests</h2>
        <span>Open • Pending • Matched • Expired • Closed</span>
      </div>

      <div className="partner-grid">
        {requests.length === 0
          ? <div className="partner-empty-state">You have not created any partner requests yet. Create one above to start matching.</div>
          : requests.map((request) => {
            const sessionDone = isSessionExpired(request.date, request.endTime, request.startTime);
            
            return (
              <div key={request.id} className="partner-card">

                {/* Card Header */}
                <div className="partner-card-head">
                  <strong>{request.sport}</strong>
                  <span className={`partner-badge ${
                    request.status === 'matched'  ? 'badge-matched'  :
                    request.status === 'expired'  ? 'badge-expired'  :
                    request.status === 'closed'   ? 'badge-closed'   :
                    request.status === 'pending'  ? 'badge-pending'  : 'badge-open'
                  }`}>
                    {request.status === 'matched'  ? 'MATCHED'            :
                     request.status === 'expired'  ? 'EXPIRED'            :
                     request.status === 'closed'   ? 'CLOSED'             :
                     request.status === 'pending'  ? 'WAITING FOR PARTNER': 'OPEN'}
                  </span>
                </div>

                {/* Meta */}
                <div className="partner-meta">
                  <span>Date: {formatDate(request.date)}</span>
                  <span>Time: {formatTime(request.startTime)}</span>
                  <span>Venue: {request.venue || 'Any'}</span>
                  <span>Skill: {request.skillLevel}</span>
                </div>

                {/* Status note */}
                <div className="partner-status-note">
                  {request.status === 'matched'  ? 'Partner confirmed. You can now chat.' :
                   request.status === 'pending'  ? 'Someone requested to join.'           :
                   request.status === 'closed'   ? 'You manually closed this request.'   :
                   request.status === 'expired'  ? 'The scheduled time has already passed.' :
                   'Your request is visible to everyone.'}
                </div>

                <div className="partner-notes">{request.notes || 'No additional notes.'}</div>

                {/* Action Buttons */}
                <div className="partner-card-actions">
                  {request.status === 'matched' ? (
                    <>
                      {sessionDone ? (
                        <div style={{
                          padding:      '12px 16px',
                          background:   '#f0f0f0',
                          borderRadius: '8px',
                          color:        '#999',
                          fontSize:     '14px',
                          textAlign:    'center',
                          border:       '1px solid #ddd',
                          width:        '100%',
                        }}>
                          🔒 Session ended — chat and partner details are no longer available.
                        </div>
                      ) : (
                        <>
                          <button className="btn-primary" onClick={() => onOpenChat(request)}>
                            💬 Talk with My Partner
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setDetailsId(detailsId === request.id ? null : request.id)}
                          >
                            View Partner Details
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={() => onEditStart(request)}>Edit</button>
                      <button className="btn-danger" onClick={() => setConfirmModal({
                        title: 'Delete request',
                        message: 'This will remove the request and related notifications. Continue?',
                        onConfirm: () => {
                          setFeedbackMap((prev) => ({ ...prev, [request.id]: 'Request deleted.' }));
                          onDelete(request.id);
                          setConfirmModal(null);
                        }
                      })}>Delete</button>
                      <button className="btn-ghost" onClick={() => setConfirmModal({
                        title: 'Close request',
                        message: 'This will stop new join requests for this session. Continue?',
                        onConfirm: () => {
                          setFeedbackMap((prev) => ({ ...prev, [request.id]: 'Request closed.' }));
                          onClose(request.id);
                          setConfirmModal(null);
                        }
                      })}>Close</button>
                    </>
                  )}
                </div>

                {/* Partner Details Box — hidden after session ends */}
                {detailsId === request.id && request.status === 'matched' && !sessionDone && (
                  <div className="partner-chat-box">
                    <div className="partner-chat-header">Partner Details</div>
                    <div className="partner-chat-messages">
                      <div className="partner-chat-message">
                        <strong>Name:</strong> {request.partnerName || 'Partner'}
                      </div>
                      <div className="partner-chat-message">
                        <strong>Registration Number:</strong> {request.partnerRegistrationNumber || '—'}
                      </div>
                      <div className="partner-chat-message">
                        <strong>Sport:</strong> {request.sport}
                      </div>
                      <div className="partner-chat-message">
                        <strong>Date:</strong> {formatDate(request.date)}
                      </div>
                      <div className="partner-chat-message">
                        <strong>Time:</strong> {formatTime(request.startTime)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback message */}
                {feedbackMap[request.id] && (
                  <div className="partner-inline-message success">{feedbackMap[request.id]}</div>
                )}

                {/* Chat Box — hidden after session ends */}
                {activeChat?.request?.id === request.id && !sessionDone && (
                  <div className="partner-chat-box">
                    <div className="partner-chat-header">Chat with your partner</div>
                    <div className="partner-chat-messages">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="partner-chat-message">
                          <strong>{message.sender_name || 'You'}:</strong> {message.message}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={onSendMessage} className="partner-chat-form">
                      <input
                        value={chatDraft}
                        onChange={(e) => onChatDraftChange(e.target.value)}
                        placeholder="Type a message"
                      />
                      <button className="btn-primary" type="submit">Send</button>
                    </form>
                  </div>
                )}

                {/* Edit Form */}
                {editingRequestId === request.id && (
                  <div className="request-editor">
                    <div className="request-editor-grid">
                      <label>Date
                        <input type="date" value={editForm.date} onChange={(e) => onEditChange('date', e.target.value)} />
                      </label>
                      <label>Start Time
                        <input type="time" value={editForm.startTime} min="08:00" max="20:00" onChange={(e) => onEditChange('startTime', e.target.value)} />
                        <span style={{ fontSize: '11px', color: '#888' }}>8:00 AM – 8:00 PM</span>
                      </label>
                      <label>End Time
                        <input type="time" value={editForm.endTime} min="08:00" max="20:00" onChange={(e) => onEditChange('endTime', e.target.value)} />
                        <span style={{ fontSize: '11px', color: '#888' }}>8:00 AM – 8:00 PM</span>
                      </label>
                      <label>Venue
                        <input type="text" value={editForm.venue} onChange={(e) => onEditChange('venue', e.target.value)} />
                      </label>
                      <label>Skill
                        <select value={editForm.skillLevel} onChange={(e) => onEditChange('skillLevel', e.target.value)}>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </label>
                      <label>Gender
                        <select value={editForm.genderPreference} onChange={(e) => onEditChange('genderPreference', e.target.value)}>
                          <option>Anyone</option>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </label>
                    </div>
                    <label>Notes
                      <textarea value={editForm.notes} onChange={(e) => onEditChange('notes', e.target.value)} />
                    </label>
                    <div className="partner-card-actions">
                      <button className="btn-primary" onClick={() => onSave(request.id)}>Save</button>
                      <button className="btn-secondary" onClick={onCancelEdit}>Cancel</button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        }
      </div>

      <ConfirmModal
        isOpen={Boolean(confirmModal)}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onCancel={() => setConfirmModal(null)}
        onConfirm={() => confirmModal?.onConfirm?.()}
      />
    </section>
  );
};

export default MyRequests;
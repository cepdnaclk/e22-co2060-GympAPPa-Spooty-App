import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import '../styles/partner-finder.css';

const NotificationPanel = ({
  notifications,
  onRead,
  onDelete,
  onAccept,
  onReject,
  onConfirm,
  onCancel,
}) => {
  const [feedbackMap, setFeedbackMap] = useState({});
  const [confirmModal, setConfirmModal] = useState(null);

  return (
    <section className="partner-panel pastel-purple">
      <div className="partner-section-title">
        <h2>Notifications</h2>
        <span>{notifications.filter((n) => !n.is_read).length} unread</span>
      </div>

      <div className="notification-list">
        {notifications.length === 0
          ? <div className="partner-empty-state">No notifications right now. New match updates will appear here.</div>
          : notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.is_read ? '' : 'unread'}`}
            >
              <div className="notification-top">
                <strong>{notification.title}</strong>
                <span>{new Date(notification.created_at).toLocaleString()}</span>
              </div>

              <div>{notification.message}</div>

              <div className="notification-actions">
                <button
                  className="btn-secondary"
                  onClick={() => onRead(notification.id)}
                >
                  Mark as Read
                </button>

                <button
                  className="btn-danger"
                  onClick={() => setConfirmModal({
                    title: 'Delete notification',
                    message: 'Remove this notification from your list?',
                    onConfirm: () => {
                      onDelete(notification.id);
                      setConfirmModal(null);
                    }
                  })}
                >
                  Delete
                </button>

                {/* Chat notification */}
                {notification.type === 'chat' && (
                  <button
                    className="btn-primary"
                    onClick={() => onRead(notification.id)}
                  >
                    💬 Open Chat
                  </button>
                )}

                {/* Join request notification */}
                {notification.type === 'join_request' && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setFeedbackMap((prev) => ({ ...prev, [notification.id]: 'Accepted successfully.' }));
                        onAccept(notification.related_request, notification.related_join_request);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        setFeedbackMap((prev) => ({ ...prev, [notification.id]: 'Rejected successfully.' }));
                        onReject(notification.related_request, notification.related_join_request);
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Request accepted notification */}
                {notification.type === 'request_accepted' && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setFeedbackMap((prev) => ({ ...prev, [notification.id]: 'Match confirmed.' }));
                        onConfirm(notification.related_request, notification.related_join_request);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        setFeedbackMap((prev) => ({ ...prev, [notification.id]: 'Match cancelled.' }));
                        onCancel(notification.related_request, notification.related_join_request);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {feedbackMap[notification.id] && (
                <div className="partner-inline-message success" style={{ marginTop: '8px' }}>
                  {feedbackMap[notification.id]}
                </div>
              )}
            </div>
          ))
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

export default NotificationPanel;
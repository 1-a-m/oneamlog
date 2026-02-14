import { AdminLayout } from '../../layouts/AdminLayout';
import type { Contact } from '../../../types';
import { formatDate } from '../../../utils/date';

interface ContactListProps {
  contacts: Contact[];
  successMsg?: string;
}

export function ContactList({ contacts, successMsg }: ContactListProps) {
  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <AdminLayout title="お問い合わせ管理">
      <div class="admin-header">
        <h1>お問い合わせ管理</h1>
        <div class="header-stats">
          <span class="stat-badge">
            未読: <strong>{unreadCount}</strong>
          </span>
          <span class="stat-badge">
            全件: <strong>{contacts.length}</strong>
          </span>
        </div>
      </div>

      {successMsg && (
        <div class="alert alert-success" style="margin-bottom: 1rem;">
          {successMsg}
        </div>
      )}

      {contacts.length === 0 ? (
        <div class="card">
          <p style="color: #666; text-align: center; padding: 2rem;">
            お問い合わせがまだありません
          </p>
        </div>
      ) : (
        <div class="contact-list">
          {contacts.map((contact) => (
            <div class={`contact-item ${!contact.is_read ? 'unread' : ''}`} key={contact.id}>
              <div class="contact-header">
                <div class="contact-info">
                  <h3>{contact.name}</h3>
                  <a href={`mailto:${contact.email}`} class="contact-email">
                    {contact.email}
                  </a>
                </div>
                <div class="contact-meta">
                  <span class="contact-date">{formatDate(contact.created_at)}</span>
                  {!contact.is_read && (
                    <form
                      method="POST"
                      action={`/api/contacts/${contact.id}/read`}
                      style="display: inline;"
                    >
                      <input type="hidden" name="_method" value="PATCH" />
                      <button type="submit" class="btn btn-sm btn-primary">
                        既読にする
                      </button>
                    </form>
                  )}
                  {contact.is_read && (
                    <span class="read-badge">既読</span>
                  )}
                </div>
              </div>
              <div class="contact-message">
                <p>{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .header-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          padding: 0.5rem 1rem;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #495057;
        }

        .stat-badge strong {
          color: #212529;
          margin-left: 0.25rem;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .contact-item.unread {
          border-left: 4px solid #0066ff;
          background: #f8f9ff;
        }

        .contact-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .contact-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .contact-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #212529;
        }

        .contact-email {
          color: #0066ff;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .contact-email:hover {
          text-decoration: underline;
        }

        .contact-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .contact-date {
          font-size: 0.875rem;
          color: #6c757d;
          white-space: nowrap;
        }

        .read-badge {
          padding: 0.25rem 0.75rem;
          background: #e9ecef;
          color: #6c757d;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .contact-message {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #dee2e6;
        }

        .contact-message p {
          margin: 0;
          color: #495057;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .contact-header {
            flex-direction: column;
          }

          .contact-meta {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

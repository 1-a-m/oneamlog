import type { Time } from '../../../types';
import { AdminLayout } from '../../layouts/AdminLayout';

interface TimesListProps {
  times: Time[];
}

export function TimesList({ times }: TimesListProps) {
  return (
    <AdminLayout title="Times管理">
      <div class="admin-header">
        <h1>Times管理</h1>
        <a href="/admin/times/new" class="btn btn-primary">新規投稿</a>
      </div>

      <div class="times-grid">
        {times.length === 0 ? (
          <p class="no-data">まだTimesがありません。</p>
        ) : (
          times.map((time) => (
            <div key={time.id} class="time-card">
              <div class="time-header">
                <span class="time-date">
                  {new Date(time.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div class="time-content">
                {time.content}
              </div>
              {time.image_url && (
                <div class="time-image">
                  <img src={time.image_url} alt="Time image" />
                </div>
              )}
              <div class="time-actions">
                <button
                  class="btn btn-sm btn-danger"
                  onclick={`deleteTime('${time.id}')`}
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        async function deleteTime(id) {
          if (!confirm('このTimeを削除しますか？')) return;

          try {
            const response = await fetch(\`/api/times/\${id}\`, {
              method: 'DELETE',
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error('削除に失敗しました');
            }

            // Reload page
            window.location.reload();
          } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました: ' + error.message);
          }
        }
      `}} />
    </AdminLayout>
  );
}

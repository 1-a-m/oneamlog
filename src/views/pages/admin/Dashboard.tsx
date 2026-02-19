import { AdminLayout } from '../../layouts/AdminLayout';
import type { Post } from '../../../types';
import { formatDate } from '../../../utils/date';

interface DashboardProps {
  posts: Post[];
}

export function Dashboard({ posts }: DashboardProps) {
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <AdminLayout title="ダッシュボード - Admin">
      <div class="admin-content">
        <h1>ダッシュボード</h1>

        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-label">公開記事</div>
            <div class="stat-value">{publishedCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">下書き</div>
            <div class="stat-value">{draftCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">総記事数</div>
            <div class="stat-value">{posts.length}</div>
          </div>
        </div>

        <div class="admin-section">
          <div class="admin-section-header">
            <h2>最近の記事</h2>
            <a href="/admin/posts/new" class="btn btn-primary btn-sm">
              ✏️ 新規作成
            </a>
          </div>

          {posts.length === 0 ? (
            <p class="empty-state">記事がまだありません。</p>
          ) : (
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>タイトル</th>
                    <th>ステータス</th>
                    <th>作成日</th>
                    <th>閲覧数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <a href={`/admin/posts/${post.id}/edit`} class="post-title-link">
                          {post.title}
                        </a>
                      </td>
                      <td>
                        <span class={`status-badge status-${post.status}`}>
                          {post.status === 'published' ? '公開' : '下書き'}
                        </span>
                      </td>
                      <td>{formatDate(post.created_at)}</td>
                      <td>{post.view_count}</td>
                      <td>
                        <div class="action-buttons">
                          <a href={`/admin/posts/${post.id}/edit`} class="btn btn-sm">
                            編集
                          </a>
                          {post.status === 'published' && (
                            <a href={`/blog/${post.slug}`} target="_blank" class="btn btn-sm">
                              表示
                            </a>
                          )}
                          <button
                            class="btn btn-sm btn-danger"
                            data-post-id={post.id}
                            data-post-title={post.title}
                            onclick="deletePost(this)"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        function deletePost(btn) {
          var title = btn.getAttribute('data-post-title');
          if (!confirm('「' + title + '」を削除しますか？\\nこの操作は取り消せません。')) return;
          var id = btn.getAttribute('data-post-id');
          btn.disabled = true;
          btn.textContent = '削除中...';
          fetch('/api/posts/' + id, { method: 'DELETE' })
            .then(function(res) {
              if (res.ok) { location.reload(); }
              else { alert('削除に失敗しました'); btn.disabled = false; btn.textContent = '削除'; }
            })
            .catch(function() { alert('削除に失敗しました'); btn.disabled = false; btn.textContent = '削除'; });
        }
      `}} />
    </AdminLayout>
  );
}

import { AdminLayout } from '../../layouts/AdminLayout';
import type { Tag } from '../../../types';

interface TagManagerProps {
  tags: Tag[];
  errorMsg?: string;
  successMsg?: string;
}

export function TagManager({ tags, errorMsg, successMsg }: TagManagerProps) {
  return (
    <AdminLayout title="タグ管理">
      <div class="admin-header">
        <h1>タグ管理</h1>
      </div>

      {errorMsg && (
        <div class="alert alert-error" style="margin-bottom: 1rem;">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div class="alert alert-success" style="margin-bottom: 1rem;">
          {successMsg}
        </div>
      )}

      <div class="tag-manager-grid">
        {/* Tag Creation Form */}
        <div class="card">
          <h2 style="margin-top: 0;">新しいタグを作成</h2>
          <form method="POST" action="/api/tags" class="tag-form">
            <div class="form-group">
              <label for="name">タグ名</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="例: JavaScript"
              />
            </div>

            <div class="form-group">
              <label for="slug">スラッグ（URL用）</label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                placeholder="例: javascript"
                pattern="[a-z0-9-]+"
              />
              <small>小文字の英数字とハイフンのみ使用可能</small>
            </div>

            <button type="submit" class="btn btn-primary">
              タグを作成
            </button>
          </form>
        </div>

        {/* Tag List */}
        <div class="card">
          <h2 style="margin-top: 0;">既存のタグ ({tags.length})</h2>

          {tags.length === 0 ? (
            <p style="color: #666;">タグがまだありません。左のフォームから作成してください。</p>
          ) : (
            <div class="tag-list">
              {tags.map((tag) => (
                <div class="tag-item" key={tag.id}>
                  <div class="tag-info">
                    <span class="tag-name">{tag.name}</span>
                    <span class="tag-slug">/{tag.slug}</span>
                  </div>
                  <form
                    method="POST"
                    action={`/api/tags/${tag.id}`}
                    style="display: inline;"
                    onsubmit="return confirm('このタグを削除しますか？関連する記事の紐付けも解除されます。');"
                  >
                    <input type="hidden" name="_method" value="DELETE" />
                    <button type="submit" class="btn btn-danger btn-sm">
                      削除
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tag-manager-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .tag-manager-grid {
            grid-template-columns: 1fr;
          }
        }

        .tag-form .form-group {
          margin-bottom: 1rem;
        }

        .tag-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tag-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .tag-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tag-name {
          font-weight: 600;
          color: #212529;
        }

        .tag-slug {
          font-size: 0.875rem;
          color: #6c757d;
          font-family: monospace;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          border: none;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 1rem;
          border-radius: 6px;
        }
      `}</style>
    </AdminLayout>
  );
}

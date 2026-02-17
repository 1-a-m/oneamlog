import { AdminLayout } from '../../layouts/AdminLayout';
import type { Work } from '../../../types';

interface WorkListProps {
  works: Work[];
  successMsg?: string;
}

export function WorkList({ works, successMsg }: WorkListProps) {
  return (
    <AdminLayout title="Work Management">
      <div class="admin-header">
        <h1>Work Management</h1>
        <a href="/admin/works/new" class="btn btn-primary">新規作成</a>
      </div>

      {successMsg && (
        <div class="alert alert-success">
          {successMsg}
        </div>
      )}

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Period</th>
              <th>Technologies</th>
              <th>Display Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr>
                <td colspan="6" class="text-center">No works found</td>
              </tr>
            ) : (
              works.map((work) => (
                <tr key={work.id}>
                  <td>{work.title}</td>
                  <td><code>{work.slug}</code></td>
                  <td>{work.period || '-'}</td>
                  <td>
                    {work.technologies.slice(0, 3).join(', ')}
                    {work.technologies.length > 3 && '...'}
                  </td>
                  <td>{work.display_order}</td>
                  <td class="admin-table-actions">
                    <a href={`/admin/works/${work.id}/edit`} class="btn btn-sm btn-secondary">
                      編集
                    </a>
                    <button
                      class="btn btn-sm btn-danger"
                      onclick={`deleteWork('${work.id}', '${work.title}')`}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function deleteWork(id, title) {
            if (!confirm(\`本当に「\${title}」を削除しますか？\`)) {
              return;
            }

            try {
              const response = await fetch(\`/api/works/\${id}\`, {
                method: 'DELETE',
              });

              if (response.ok) {
                window.location.href = '/admin/works?success=deleted';
              } else {
                alert('削除に失敗しました');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('削除に失敗しました');
            }
          }
        `
      }} />
    </AdminLayout>
  );
}

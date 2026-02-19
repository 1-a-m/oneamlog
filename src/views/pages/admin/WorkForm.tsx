import { AdminLayout } from '../../layouts/AdminLayout';
import type { Work } from '../../../types';

interface WorkFormProps {
  work?: Work;
  error?: string;
}

export function WorkForm({ work, error }: WorkFormProps) {
  const isEdit = !!work;
  const title = isEdit ? 'Edit Work' : 'Create New Work';

  return (
    <AdminLayout title={title}>
      <div class="admin-header">
        <h1>{title}</h1>
        <a href="/admin/works" class="btn btn-secondary">戻る</a>
      </div>

      {error && (
        <div class="alert alert-error">
          {error}
        </div>
      )}

      <form id="workForm" class="admin-form">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={work?.title || ''}
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="slug">Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            value={work?.slug || ''}
            placeholder="url-friendly-slug"
            pattern="[a-z0-9-]+"
            class="form-input"
          />
          <small class="form-hint">Only lowercase letters, numbers, and hyphens</small>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            class="form-input"
          >{work?.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="period">Period</label>
          <input
            type="text"
            id="period"
            name="period"
            value={work?.period || ''}
            placeholder="2023年4月 - 2023年6月"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="position">Position</label>
          <input
            type="text"
            id="position"
            name="position"
            value={work?.position || ''}
            placeholder="バックエンドエンジニア"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={work?.category || ''}
            placeholder="業務 / 自作 / OSS"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="languages">Languages</label>
          <input
            type="text"
            id="languages"
            name="languages"
            value={work?.languages?.join(', ') || ''}
            placeholder="TypeScript, Python, Go"
            class="form-input"
          />
          <small class="form-hint">カンマ区切り</small>
        </div>

        <div class="form-group">
          <label for="libraries">Libraries / Frameworks</label>
          <input
            type="text"
            id="libraries"
            name="libraries"
            value={work?.libraries?.join(', ') || ''}
            placeholder="React, Hono, FastAPI"
            class="form-input"
          />
          <small class="form-hint">カンマ区切り</small>
        </div>

        <div class="form-group">
          <label for="environments">Environments</label>
          <input
            type="text"
            id="environments"
            name="environments"
            value={work?.environments?.join(', ') || ''}
            placeholder="AWS, Google Cloud, オンプレ"
            class="form-input"
          />
          <small class="form-hint">カンマ区切り</small>
        </div>

        <div class="form-group">
          <label for="tools">Tools</label>
          <input
            type="text"
            id="tools"
            name="tools"
            value={work?.tools?.join(', ') || ''}
            placeholder="GitHub, Docker, Terraform"
            class="form-input"
          />
          <small class="form-hint">カンマ区切り</small>
        </div>

        <div class="form-group">
          <label for="technologies">Technologies (その他)</label>
          <input
            type="text"
            id="technologies"
            name="technologies"
            value={work?.technologies?.join(', ') || ''}
            placeholder="TypeScript, React, Node.js"
            class="form-input"
          />
          <small class="form-hint">カンマ区切り</small>
        </div>

        <div class="form-group">
          <label for="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={work?.image_url || ''}
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="project_url">Project URL</label>
          <input
            type="url"
            id="project_url"
            name="project_url"
            value={work?.project_url || ''}
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="github_url">GitHub URL</label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            value={work?.github_url || ''}
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="display_order">Display Order</label>
          <input
            type="number"
            id="display_order"
            name="display_order"
            value={work?.display_order || 0}
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {isEdit ? '更新' : '作成'}
          </button>
          <a href="/admin/works" class="btn btn-secondary">キャンセル</a>
        </div>
      </form>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('workForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = {
              title: formData.get('title'),
              slug: formData.get('slug'),
              description: formData.get('description'),
              period: formData.get('period'),
              position: formData.get('position'),
              category: formData.get('category'),
              languages: formData.get('languages'),
              libraries: formData.get('libraries'),
              environments: formData.get('environments'),
              tools: formData.get('tools'),
              technologies: formData.get('technologies'),
              image_url: formData.get('image_url'),
              project_url: formData.get('project_url'),
              github_url: formData.get('github_url'),
              display_order: formData.get('display_order'),
            };

            try {
              const url = ${isEdit ? `'/api/works/${work?.id}'` : "'/api/works'"};
              const method = ${isEdit ? "'PUT'" : "'POST'"};

              const response = await fetch(url, {
                method: method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (response.ok) {
                window.location.href = '/admin/works?success=${isEdit ? 'updated' : 'created'}';
              } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Unknown error'));
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to ${isEdit ? 'update' : 'create'} work');
            }
          });

          // Auto-generate slug from title
          document.getElementById('title').addEventListener('input', (e) => {
            const slugInput = document.getElementById('slug');
            if (!slugInput.value || ${!isEdit}) {
              const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              slugInput.value = slug;
            }
          });
        `
      }} />
    </AdminLayout>
  );
}

import { AdminLayout } from '../../layouts/AdminLayout';
import type { Post, Tag } from '../../../types';

interface PostEditorProps {
  post?: Post;
  allTags: Tag[];
  errorMsg?: string;
}

export function PostEditor({ post, allTags, errorMsg }: PostEditorProps) {
  const isEdit = !!post;
  const title = isEdit ? `記事編集 - ${post.title}` : '新規記事作成';

  return (
    <AdminLayout title={title}>
      <div class="admin-content">
        <div class="editor-header">
          <h1>{isEdit ? '記事を編集' : '新規記事を作成'}</h1>
          <a href="/admin" class="btn btn-secondary">
            ← ダッシュボードに戻る
          </a>
        </div>

        {errorMsg && (
          <div class="alert alert-error">
            {errorMsg}
          </div>
        )}

        <form
          method="POST"
          action={isEdit ? `/api/posts/${post.id}` : '/api/posts'}
          class="post-editor-form"
        >
          {isEdit && <input type="hidden" name="_method" value="PUT" />}

          <div class="editor-main">
            <div class="form-group">
              <label for="title">タイトル *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={post?.title || ''}
                required
                placeholder="記事のタイトルを入力"
              />
            </div>

            <div class="form-group">
              <label for="slug">スラッグ *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={post?.slug || ''}
                required
                placeholder="url-friendly-slug"
                pattern="[a-z0-9-]+"
              />
              <small class="form-hint">
                小文字英数字とハイフンのみ使用可能（例: my-first-post）
              </small>
            </div>

            <div class="form-group">
              <label for="excerpt">抜粋</label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                placeholder="記事の簡単な説明（任意）"
              >{post?.excerpt || ''}</textarea>
            </div>

            <div class="form-group">
              <label for="content">本文 * (Markdown)</label>
              <textarea
                id="content"
                name="content"
                rows={20}
                required
                placeholder="# 見出し&#10;&#10;本文をMarkdown形式で書きましょう..."
              >{post?.content || ''}</textarea>
              <small class="form-hint">
                Markdown 記法が使えます。
                <a href="https://www.markdownguide.org/basic-syntax/" target="_blank">
                  Markdown ガイド
                </a>
              </small>
            </div>
          </div>

          <div class="editor-sidebar">
            <div class="editor-actions">
              <h3>公開設定</h3>

              <div class="form-group">
                <label for="status">ステータス</label>
                <select id="status" name="status">
                  <option value="draft" selected={post?.status === 'draft' || !post}>
                    下書き
                  </option>
                  <option value="published" selected={post?.status === 'published'}>
                    公開
                  </option>
                </select>
              </div>

              <div class="editor-buttons">
                <button type="submit" class="btn btn-primary btn-block">
                  {isEdit ? '更新' : '作成'}
                </button>
                {isEdit && post.status === 'published' && (
                  <a href={`/blog/${post.slug}`} target="_blank" class="btn btn-secondary btn-block">
                    プレビュー
                  </a>
                )}
                {isEdit && (
                  <button
                    type="button"
                    class="btn btn-danger btn-block"
                    onclick={`if(confirm('本当に削除しますか？')) { fetch('/api/posts/${post.id}', { method: 'DELETE' }).then(() => location.href = '/admin') }`}
                  >
                    削除
                  </button>
                )}
              </div>
            </div>

            <div class="editor-tags">
              <h3>タグ</h3>
              {allTags.length === 0 ? (
                <p class="empty-state-sm">
                  タグがありません。<a href="/admin/tags">タグを作成</a>
                </p>
              ) : (
                <div class="tag-checkboxes">
                  {allTags.map((tag) => {
                    const isChecked = post?.tags?.some(t => t.id === tag.id);
                    return (
                      <label key={tag.id} class="tag-checkbox-label">
                        <input
                          type="checkbox"
                          name="tags"
                          value={tag.id}
                          checked={isChecked}
                        />
                        <span>{tag.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

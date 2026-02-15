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
          class="post-editor-form-wrapper"
          id="post-editor-form"
        >
          {isEdit && <input type="hidden" name="_method" value="PUT" />}

          {/* 基本情報セクション */}
          <div class="editor-basic-info">
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

            <div class="form-row">
              <div class="form-group">
                <label for="slug">スラッグ *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={post?.slug || ''}
                  required
                  placeholder="url-friendly-slug"
                  pattern="[a-z0-9\-]+"
                />
                <small class="form-hint">
                  小文字英数字とハイフンのみ（例: my-first-post）
                </small>
              </div>

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
            </div>

            <div class="form-group">
              <label for="excerpt">抜粋</label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                placeholder="記事の簡単な説明（任意）"
              >{post?.excerpt || ''}</textarea>
            </div>
          </div>

          {/* Milkdown Editor with Toggle Source View */}
          <div class="form-group">
            <div class="editor-header-row">
              <label for="content">本文 * (Markdown)</label>
              <button
                type="button"
                id="toggle-source-btn"
                class="btn btn-secondary btn-sm"
              >
                📄 Markdown ソース表示
              </button>
            </div>
            <div class="editor-split-view" id="editor-container">
              <div class="editor-pane">
                <div class="editor-pane-header">
                  <span>WYSIWYG エディタ</span>
                </div>
                <div id="editor" class="milkdown-editor"></div>
              </div>
              <div class="editor-pane editor-source-pane" id="source-pane" style="display: none;">
                <div class="editor-pane-header">
                  <span>Markdown ソース</span>
                </div>
                <textarea
                  id="markdown-source"
                  class="markdown-source-editor"
                  readonly
                  placeholder="Markdown プレビュー（読み取り専用）"
                >{post?.content || ''}</textarea>
              </div>
            </div>
            <textarea
              id="content"
              name="content"
              required
              style="display: none;"
            >{post?.content || ''}</textarea>
            <small class="form-hint">
              Markdown 記法が使えます。画像はドラッグ&ドロップでアップロードできます。
            </small>
          </div>

          {/* タグと操作 */}
          <div class="editor-footer">
            <div class="editor-tags-section">
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

            <div class="editor-buttons">
              <button type="submit" class="btn btn-primary">
                {isEdit ? '更新' : '作成'}
              </button>
              {isEdit && post.status === 'published' && (
                <a href={`/blog/${post.slug}`} target="_blank" class="btn btn-secondary">
                  公開ページを見る
                </a>
              )}
              {isEdit && (
                <button
                  type="button"
                  class="btn btn-danger"
                  onclick={`if(confirm('本当に削除しますか？')) { fetch('/api/posts/${post.id}', { method: 'DELETE' }).then(() => location.href = '/admin') }`}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Milkdown Editor */}
      <script type="module" src={`/dist/editor.js?v=${Date.now()}`}></script>
      <script type="module" dangerouslySetInnerHTML={{__html: `
        (async function() {
          // Wait for the module to load
          await new Promise(resolve => {
            if (window.initMilkdownEditor) {
              resolve();
            } else {
              const checkInterval = setInterval(() => {
                if (window.initMilkdownEditor) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
            }
          });

          // 各要素を取得
          const contentTextarea = document.getElementById('content');
          const markdownSource = document.getElementById('markdown-source');
          const initialValue = contentTextarea.value || '';

          let isUpdatingFromSource = false;
          let isUpdatingFromEditor = false;

          // Milkdown Editor 初期化（awaitで完全に初期化されるまで待つ）
          const editorElement = document.getElementById('editor');
          const editorInstance = await window.initMilkdownEditor(
            editorElement,
            initialValue,
            (markdown) => {
              if (isUpdatingFromSource) {
                return;
              }

              isUpdatingFromEditor = true;
              // Markdown ソースとフォーム用 textarea に同期
              markdownSource.value = markdown;
              contentTextarea.value = markdown;
              isUpdatingFromEditor = false;
            }
          );

          // Markdown ソースエディタからの変更をフォーム送信用textareaに同期
          // 注: WYSIWYGエディタへの逆同期は技術的制約により現在は無効化
          markdownSource.addEventListener('input', (e) => {
            if (isUpdatingFromEditor) return;
            const markdown = e.target.value;
            contentTextarea.value = markdown;
          });

          // Markdown ソース表示トグル機能
          const toggleBtn = document.getElementById('toggle-source-btn');
          const sourcePane = document.getElementById('source-pane');
          const editorContainer = document.getElementById('editor-container');
          let isSourceVisible = false;

          toggleBtn.addEventListener('click', () => {
            isSourceVisible = !isSourceVisible;
            if (isSourceVisible) {
              sourcePane.style.display = 'flex';
              editorContainer.style.gridTemplateColumns = '1fr 1fr';
              toggleBtn.textContent = '✕ Markdown ソース非表示';
            } else {
              sourcePane.style.display = 'none';
              editorContainer.style.gridTemplateColumns = '1fr';
              toggleBtn.textContent = '📄 Markdown ソース表示';
            }
          });
        })();
      `}} />
    </AdminLayout>
  );
}

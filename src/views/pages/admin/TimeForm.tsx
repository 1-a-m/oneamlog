import { AdminLayout } from '../../layouts/AdminLayout';

export function TimeForm() {
  return (
    <AdminLayout title="Times投稿">
      <div class="admin-header">
        <h1>Times投稿</h1>
        <a href="/admin/times" class="btn btn-secondary">← 戻る</a>
      </div>

      <div class="card">
        <form id="time-form" class="form">
          <div class="form-group">
            <label for="content">つぶやき * (280文字以内)</label>
            <textarea
              id="content"
              name="content"
              rows={4}
              maxlength={280}
              placeholder="今何してる？何を考えてる？"
              required
            ></textarea>
            <div class="char-counter">
              <span id="char-count">0</span> / 280
            </div>
          </div>

          <div class="form-group">
            <label for="image">画像（任意）</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            />
            <div id="image-preview" class="image-preview" style="display: none;">
              <img id="preview-img" src="" alt="Preview" />
              <button type="button" id="remove-image" class="btn btn-sm btn-secondary">
                画像を削除
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-btn">
              投稿
            </button>
          </div>
        </form>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        const contentTextarea = document.getElementById('content');
        const charCount = document.getElementById('char-count');
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const removeImageBtn = document.getElementById('remove-image');
        const form = document.getElementById('time-form');
        const submitBtn = document.getElementById('submit-btn');

        let uploadedImageUrl = null;

        // Character counter
        contentTextarea.addEventListener('input', () => {
          const length = contentTextarea.value.length;
          charCount.textContent = length;

          if (length > 280) {
            charCount.style.color = 'red';
          } else if (length > 250) {
            charCount.style.color = 'orange';
          } else {
            charCount.style.color = 'inherit';
          }
        });

        // Image preview
        imageInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // Show preview
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
          };
          reader.readAsDataURL(file);

          // Upload image
          try {
            submitBtn.disabled = true;
            submitBtn.textContent = '画像をアップロード中...';

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/image', {
              method: 'POST',
              credentials: 'include',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('画像のアップロードに失敗しました');
            }

            const data = await response.json();
            uploadedImageUrl = data.url;
            submitBtn.disabled = false;
            submitBtn.textContent = '投稿';
          } catch (error) {
            console.error('Upload error:', error);
            alert('画像のアップロードに失敗しました: ' + error.message);
            imageInput.value = '';
            imagePreview.style.display = 'none';
            uploadedImageUrl = null;
            submitBtn.disabled = false;
            submitBtn.textContent = '投稿';
          }
        });

        // Remove image
        removeImageBtn.addEventListener('click', () => {
          imageInput.value = '';
          imagePreview.style.display = 'none';
          uploadedImageUrl = null;
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const content = contentTextarea.value.trim();

          if (!content) {
            alert('つぶやきを入力してください');
            return;
          }

          if (content.length > 280) {
            alert('つぶやきは280文字以内で入力してください');
            return;
          }

          try {
            submitBtn.disabled = true;
            submitBtn.textContent = '投稿中...';

            const response = await fetch('/api/times', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                image_url: uploadedImageUrl,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || '投稿に失敗しました');
            }

            // Redirect to times list
            window.location.href = '/admin/times?success=' + encodeURIComponent('投稿しました');
          } catch (error) {
            console.error('Submit error:', error);
            alert('投稿に失敗しました: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '投稿';
          }
        });
      `}} />
    </AdminLayout>
  );
}

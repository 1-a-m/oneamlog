import { BaseLayout } from '../layouts/BaseLayout';

interface ContactProps {
  success?: boolean;
  error?: string;
}

export function Contact({ success, error }: ContactProps = {}) {
  return (
    <BaseLayout title="Contact - oneamlog" description="お問い合わせフォーム">
      <div class="container">
        <section class="contact">
          <h1>Contact</h1>
          <p>お気軽にお問い合わせください。</p>

          {success && (
            <div class="alert alert-success">
              お問い合わせありがとうございます。確認次第ご連絡いたします。
            </div>
          )}

          {error && (
            <div class="alert alert-error">
              {error}
            </div>
          )}

          <form method="post" action="/contact" class="contact-form">
            <div class="form-group">
              <label for="name">お名前</label>
              <input type="text" id="name" name="name" required />
            </div>

            <div class="form-group">
              <label for="email">メールアドレス</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
              <label for="message">メッセージ</label>
              <textarea id="message" name="message" rows={6} required></textarea>
            </div>

            <button type="submit" class="btn btn-primary">送信</button>
          </form>
        </section>
      </div>
    </BaseLayout>
  );
}

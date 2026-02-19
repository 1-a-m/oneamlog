# oneamlog セキュリティ設計書

## 概要

oneamlogのセキュリティ対策を記載する。Webアプリケーションの一般的な脅威（OWASP Top 10）への防御と、依存パッケージの脆弱性管理を対象とする。

## 1. HTTPセキュリティヘッダー

### 実装箇所
- **ミドルウェア**: `src/middleware/security.ts`
- **適用範囲**: 全ルート（`src/index.ts` で `app.use('*', securityHeaders)` として登録）

### 設定一覧

| ヘッダー | 値 | 目的 |
|---------|---|------|
| `X-Content-Type-Options` | `nosniff` | ブラウザによるMIMEタイプの推測を防止。悪意あるファイルをスクリプトとして実行されるリスクを低減 |
| `X-Frame-Options` | `DENY` | 他サイトの`<iframe>`内での表示を禁止。クリックジャッキング攻撃を防止 |
| `X-XSS-Protection` | `0` | レガシーなXSSフィルタを無効化。CSPで代替するため、誤検知によるリスクを排除 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 外部サイトへの遷移時にURL全体ではなくオリジンのみを送信。パスに含まれる情報の漏洩を防止 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要なブラウザAPI（カメラ、マイク、位置情報）を無効化 |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | 1年間HTTPS通信を強制。中間者攻撃によるHTTPダウングレードを防止 |
| `Content-Security-Policy` | 下記参照 | クロスサイトスクリプティング（XSS）を防止 |

### Content-Security-Policy 詳細

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' https://*.supabase.co data:;
connect-src 'self' https://*.supabase.co;
font-src 'self';
```

| ディレクティブ | 許可対象 | 理由 |
|-------------|---------|------|
| `default-src` | `'self'` | 基本は自ドメインのみ許可 |
| `script-src` | `'self'`, `'unsafe-inline'`, `cloudflareinsights.com` | Hono JSXのインラインスクリプト + Cloudflare Web Analytics |
| `style-src` | `'self'`, `'unsafe-inline'` | CSSファイル + インラインスタイル |
| `img-src` | `'self'`, `*.supabase.co`, `data:` | Supabase Storageの画像 + data URI |
| `connect-src` | `'self'`, `*.supabase.co` | Supabase API通信（認証・データ取得） |
| `font-src` | `'self'` | 自ドメインのフォントのみ |

## 2. 認証・セッション管理

### 実装箇所
- **認証ミドルウェア**: `src/middleware/auth.ts`
- **セッション管理**: `src/lib/session.ts`

### 方式
- Supabase Authによるメール/パスワード認証
- JWTトークンをHttpOnly Cookieに保存
- アクセストークン（有効期限: Supabaseデフォルト1時間）が期限切れの場合、リフレッシュトークンで自動更新

### Cookie設定
| 属性 | 値 | 目的 |
|-----|---|------|
| `httpOnly` | `true` | JavaScriptからのCookieアクセスを防止（XSS対策） |
| `secure` | `true` | HTTPS通信時のみCookieを送信 |
| `sameSite` | `Lax` | クロスサイトリクエスト時のCookie送信を制限（CSRF対策） |
| `path` | `/` | サイト全体で有効 |
| `maxAge` | アクセストークン: 7日 / リフレッシュトークン: 30日 | トークン有効期間 |

### 保護対象ルート
- `/admin/*` — 管理画面全体
- `/api/posts/*` — 記事CRUD
- `/api/tags/*` — タグCRUD
- `/api/times/*` — Times投稿（GET以外）
- `/api/works/*` — Work CRUD
- `/api/upload/*` — 画像アップロード

## 3. 依存パッケージの脆弱性管理

### npm audit（CI）
- **設定ファイル**: `.github/workflows/security.yml`
- **実行タイミング**:
  - `main`ブランチへのpush時
  - Pull Request作成時
  - 毎週月曜日 0:00 UTC（スケジュール実行）
- **検出レベル**: `high` 以上で失敗（`npm audit --audit-level=high`）

### Dependabot
- **設定ファイル**: `.github/dependabot.yml`
- **対象**: npm パッケージ
- **チェック頻度**: 週次
- **自動PR上限**: 5件/週
- **動作**: 依存パッケージに更新がある場合、自動でPull Requestを作成

## 4. インフラレベルのセキュリティ

### Cloudflare Workers
- DDoS防御はCloudflareが自動提供
- Workers上で動作するためサーバーレス（SSHやポート管理不要）
- 環境変数（Supabase認証情報）は `wrangler secret` で管理

### Supabase
- Row Level Security (RLS) によるデータアクセス制御
- 管理操作はService Role Key（サーバーサイドのみ）を使用
- Anon Keyは公開読み取り用途のみ

## 5. 入力バリデーション

### 実装箇所
- `src/lib/validation.ts`

### 対象
| 機能 | バリデーション内容 |
|-----|-----------------|
| ブログ記事 | タイトル・スラッグ必須、ステータス値チェック |
| タグ | 名前・スラッグ必須、スラッグ重複チェック |
| お問い合わせ | 名前・メール・メッセージ必須 |
| Times | コンテンツ必須 |
| Work | タイトル・スラッグ・説明必須 |

### 画像アップロード
- **許可MIMEタイプ**: JPEG, PNG, GIF, WebP
- **最大サイズ**: 5MB
- **保存先**: Supabase Storage（`blog-images`バケット）

## 変更履歴

| 日付 | 内容 |
|-----|------|
| 2026-02-19 | 初版作成。HTTPセキュリティヘッダー、npm audit CI、Dependabot導入 |

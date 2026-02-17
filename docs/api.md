# API設計

## ルーティング概要

oneamlog は3つの主要ルートグループを持ちます：

1. **公開ルート** (`/`) - SSRによるHTMLレスポンス
2. **管理画面ルート** (`/admin/*`) - 認証必須のSSR
3. **APIルート** (`/api/*`) - JSON形式のREST API

## 公開ルート

### GET /

ホームページ。最新のブログ記事4件と最新のTimes3件をサイドバーに表示。

**レスポンス:** HTML

**クエリ:**
```sql
-- 最新記事
SELECT id, title, slug, excerpt, published_at, view_count
FROM posts WHERE status = 'published'
ORDER BY published_at DESC LIMIT 4;

-- 最新Times
SELECT * FROM times
ORDER BY created_at DESC LIMIT 3;
```

---

### GET /about

About ページ。経歴、技術スタック、興味・関心を表示。

**レスポンス:** HTML（静的コンテンツ）

---

### GET /work

実績一覧ページ。プロジェクトをグリッドカードで表示順に表示。

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM works
ORDER BY display_order ASC, created_at DESC;
```

---

### GET /work/:slug

実績詳細ページ。

**パスパラメータ:**
- `slug`: 実績のスラッグ

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM works WHERE slug = :slug;
```

---

### GET /work/id/:id

実績詳細ページ（slug 未設定の場合のフォールバック）。

**パスパラメータ:**
- `id`: 実績ID

**レスポンス:** HTML

---

### GET /times

Times 一覧ページ。タイムライン形式で全投稿を表示。

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM times ORDER BY created_at DESC;
```

---

### GET /blog

ブログ記事一覧。タグフィルタリング対応。

**クエリパラメータ:**
- `tag` (optional): タグのスラッグでフィルタリング

**レスポンス:** HTML

**クエリ:**
```sql
-- すべての記事
SELECT p.*, pt.tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC

-- タグ一覧
SELECT * FROM tags ORDER BY name
```

---

### GET /blog/:slug

ブログ記事詳細。Markdown を HTML にレンダリング。閲覧数をインクリメント。

**パスパラメータ:**
- `slug`: 記事のスラッグ

**レスポンス:** HTML

**クエリ:**
```sql
-- 記事取得
SELECT p.*, pt.tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.slug = :slug AND p.status = 'published'

-- 閲覧数インクリメント
UPDATE posts
SET view_count = view_count + 1
WHERE id = :id
```

---

### GET /contact

お問い合わせページ。

**クエリパラメータ:**
- `success` (optional): 送信成功時に `true`

**レスポンス:** HTML

---

### POST /contact

お問い合わせフォーム送信。

**リクエストボディ:**
```
name: string (必須, 最大255文字)
email: string (必須, メール形式)
message: string (必須)
```

**レスポンス:**
- 成功: 302 Redirect → `/contact?success=true`
- 失敗: HTML（エラーメッセージ付き）

**バリデーション:**
- name: 1-255文字
- email: 有効なメールアドレス
- message: 1文字以上

**クエリ:**
```sql
INSERT INTO contacts (name, email, message)
VALUES (:name, :email, :message)
```

---

### GET /sitemap.xml

サイトマップ（XML形式）。

**レスポンス:** XML

**含まれるURL:**
- 静的ページ: `/`, `/about`, `/contact`, `/blog`
- ブログ記事: `/blog/:slug`（公開済みのみ）

---

### GET /robots.txt

ロボット制御ファイル。

**レスポンス:** text/plain

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://oneamlog.pages.dev/sitemap.xml
```

---

## 管理画面ルート

すべての管理画面ルートは認証ミドルウェアで保護されています。

### GET /admin/login

ログインページ（非認証）。

**レスポンス:** HTML

---

### GET /admin

ダッシュボード。記事一覧を表示。

**認証:** 必須

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM posts
ORDER BY created_at DESC
```

---

### GET /admin/posts/new

新規記事作成ページ。

**認証:** 必須

**レスポンス:** HTML

---

### GET /admin/posts/:id/edit

記事編集ページ。

**認証:** 必須

**パスパラメータ:**
- `id`: 記事ID

**レスポンス:** HTML

**クエリ:**
```sql
SELECT p.*, ARRAY_AGG(t.id) as tag_ids
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.id = :id
GROUP BY p.id
```

---

### GET /admin/tags

タグ管理ページ。

**認証:** 必須

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM tags ORDER BY name
```

---

### GET /admin/contacts

お問い合わせ一覧ページ。

**認証:** 必須

**レスポンス:** HTML

**クエリ:**
```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

---

### GET /admin/times

Times 投稿管理ページ。全投稿一覧を表示。

**認証:** 必須

**レスポンス:** HTML

---

### GET /admin/times/new

Times 新規投稿ページ。280文字制限、画像アップロード対応。

**認証:** 必須

**レスポンス:** HTML

---

### GET /admin/works

Work 一覧管理ページ。

**認証:** 必須

**レスポンス:** HTML

---

### GET /admin/works/new

Work 新規作成ページ。タイトルから slug を自動生成。

**認証:** 必須

**レスポンス:** HTML

---

### GET /admin/works/:id/edit

Work 編集ページ。

**認証:** 必須

**パスパラメータ:**
- `id`: Work ID

**レスポンス:** HTML

---

## APIルート

JSON 形式のREST API。

### 認証エンドポイント

#### POST /api/auth/login

ログイン。Supabase Auth で認証し、JWT トークンを Cookie に保存。

**認証:** 不要

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Cookie設定:**
- `sb-access-token`: JWT アクセストークン（HttpOnly, Secure, SameSite=Lax）
- `sb-refresh-token`: リフレッシュトークン（HttpOnly, Secure, SameSite=Lax）

**エラーレスポンス:**
```json
{
  "error": "Invalid credentials"
}
```

---

#### POST /api/auth/logout

ログアウト。Cookie をクリア。

**認証:** 必須

**レスポンス:**
```json
{
  "success": true
}
```

---

### 記事エンドポイント

#### POST /api/posts

新規記事作成。

**認証:** 必須

**リクエストボディ:**
```json
{
  "title": "記事タイトル",
  "slug": "article-slug",
  "content": "# 記事本文\n\nMarkdown形式",
  "excerpt": "記事の抜粋",
  "status": "draft" | "published",
  "published_at": "2025-01-15T10:00:00Z"
}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "title": "記事タイトル",
  "slug": "article-slug",
  ...
}
```

**バリデーション:**
- title: 必須, 1-255文字
- slug: 必須, 1-255文字, 英数字とハイフンのみ
- content: 必須
- status: 'draft' または 'published'

---

#### PUT /api/posts/:id

記事更新。

**認証:** 必須

**パスパラメータ:**
- `id`: 記事ID

**リクエストボディ:** POST /api/posts と同じ

**レスポンス:**
```json
{
  "id": "uuid",
  "title": "更新されたタイトル",
  ...
}
```

---

#### DELETE /api/posts/:id

記事削除。

**認証:** 必須

**パスパラメータ:**
- `id`: 記事ID

**レスポンス:**
```json
{
  "success": true
}
```

---

#### POST /api/posts/:postId/tags/:tagId

記事にタグを紐付け。

**認証:** 必須

**パスパラメータ:**
- `postId`: 記事ID
- `tagId`: タグID

**レスポンス:**
```json
{
  "success": true
}
```

---

#### DELETE /api/posts/:postId/tags/:tagId

記事からタグを削除。

**認証:** 必須

**パスパラメータ:**
- `postId`: 記事ID
- `tagId`: タグID

**レスポンス:**
```json
{
  "success": true
}
```

---

### タグエンドポイント

#### POST /api/tags

タグ作成。

**認証:** 必須

**リクエストボディ:**
```json
{
  "name": "タグ名",
  "slug": "tag-slug"
}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "name": "タグ名",
  "slug": "tag-slug",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**バリデーション:**
- name: 必須, 1-100文字
- slug: 必須, 1-100文字, 英数字とハイフンのみ

---

#### DELETE /api/tags/:id

タグ削除。紐付けられている記事からも削除される（CASCADE）。

**認証:** 必須

**パスパラメータ:**
- `id`: タグID

**レスポンス:**
```json
{
  "success": true
}
```

---

### Times エンドポイント

#### GET /api/times

Times 全件取得（公開、認証不要）。

**認証:** 不要

**レスポンス:**
```json
[
  {
    "id": "uuid",
    "content": "投稿内容（最大280文字）",
    "image_url": null,
    "created_at": "2025-01-15T10:00:00Z",
    "author_id": "uuid"
  }
]
```

---

#### POST /api/times

Times 投稿。

**認証:** 必須

**リクエストボディ:**
```json
{
  "content": "投稿内容（必須, 最大280文字）",
  "image_url": "https://example.com/image.jpg"
}
```

**バリデーション:**
- content: 必須, 1-280文字

---

#### DELETE /api/times/:id

Times 削除。

**認証:** 必須

**パスパラメータ:**
- `id`: 投稿ID

**レスポンス:**
```json
{ "success": true }
```

---

### 実績（Work）エンドポイント

#### POST /api/works

実績作成。

**認証:** 必須

**リクエストボディ:**
```json
{
  "title": "プロジェクト名",
  "slug": "project-slug",
  "description": "プロジェクト説明",
  "image_url": "https://example.com/image.jpg",
  "project_url": "https://example.com",
  "github_url": "https://github.com/user/repo",
  "technologies": "TypeScript, React, Node.js",
  "period": "2023年4月 - 2023年6月",
  "display_order": 1
}
```

**バリデーション:**
- title: 必須
- slug: 必須, 英数字とハイフンのみ
- description: 必須

**レスポンス:**
```json
{
  "id": "uuid",
  "title": "プロジェクト名",
  ...
}
```

---

#### PUT /api/works/:id

実績更新。

**認証:** 必須

**パスパラメータ:**
- `id`: 実績ID

**リクエストボディ:** POST /api/works と同じ

---

#### DELETE /api/works/:id

実績削除。

**認証:** 必須

**パスパラメータ:**
- `id`: 実績ID

**レスポンス:**
```json
{
  "success": true
}
```

---

### お問い合わせエンドポイント

#### GET /api/contacts

お問い合わせ一覧取得。

**認証:** 必須

**レスポンス:**
```json
[
  {
    "id": "uuid",
    "name": "山田太郎",
    "email": "yamada@example.com",
    "message": "お問い合わせ内容",
    "created_at": "2025-01-15T10:00:00Z",
    "is_read": false
  },
  ...
]
```

---

#### PATCH /api/contacts/:id/read

お問い合わせを既読にする。

**認証:** 必須

**パスパラメータ:**
- `id`: お問い合わせID

**レスポンス:**
```json
{
  "success": true
}
```

---

## エラーレスポンス

すべてのAPIエンドポイントは、エラー時に以下の形式でレスポンスを返します：

```json
{
  "error": "エラーメッセージ"
}
```

**HTTPステータスコード:**
- `200 OK`: 成功
- `302 Found`: リダイレクト
- `400 Bad Request`: バリデーションエラー
- `401 Unauthorized`: 認証エラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

## CORS設定

現在、CORS ヘッダーは設定されていません。すべてのリクエストは同一オリジンからのみ許可されます。

将来的に外部からAPIを呼び出す場合は、Hono の `cors` ミドルウェアを追加：

```typescript
import { cors } from 'hono/cors';

app.use('/api/*', cors({
  origin: 'https://example.com',
  credentials: true,
}));
```

## レート制限

Cloudflare Workers の無料枠では、100,000 リクエスト/日 の制限があります。

必要に応じて、Cloudflare の Rate Limiting 機能を使用して、特定のエンドポイントに制限を追加できます。

# oneamlog プロジェクト構成ガイド

## 概要

Hono（Cloudflare Workers）+ Supabase で構築されたSSR（サーバーサイドレンダリング）アプリケーション。
Reactは使わず、Hono JSXでHTMLを生成してブラウザに返す構成。

## ディレクトリ構成

```
oneamlog/
├── src/                          # サーバーサイドコード（Hono）
│   ├── index.ts                  # エントリポイント（ミドルウェア・ルート登録）
│   ├── routes/                   # ルーティング
│   │   ├── public.tsx            # 公開ページ（/, /blog, /work 等）
│   │   ├── admin.tsx             # 管理画面（/admin/*）
│   │   └── api.ts                # API（/api/*）
│   ├── middleware/               # ミドルウェア
│   │   ├── auth.ts               # 認証チェック
│   │   └── security.ts           # セキュリティヘッダー付与
│   ├── lib/                      # ユーティリティ
│   │   ├── supabase.ts           # Supabaseクライアント生成
│   │   ├── session.ts            # Cookie管理
│   │   ├── validation.ts         # バリデーション関数
│   │   └── markdown.ts           # Markdown→HTML変換
│   ├── views/                    # 画面（JSXコンポーネント）
│   │   ├── layouts/              # レイアウト（HTML骨格）
│   │   │   ├── BaseLayout.tsx    # 公開ページ用
│   │   │   └── AdminLayout.tsx   # 管理画面用
│   │   ├── components/           # 共通パーツ
│   │   │   ├── Header.tsx        # ナビゲーション
│   │   │   ├── Footer.tsx        # フッター
│   │   │   ├── BlogCard.tsx      # ブログカード
│   │   │   ├── WorkCard.tsx      # Workカード
│   │   │   └── TagBadge.tsx      # タグバッジ
│   │   └── pages/                # ページコンポーネント
│   │       ├── Home.tsx
│   │       ├── About.tsx
│   │       ├── BlogList.tsx
│   │       ├── BlogPost.tsx
│   │       ├── Contact.tsx
│   │       ├── Work.tsx
│   │       ├── WorkDetail.tsx
│   │       ├── Times.tsx
│   │       └── admin/            # 管理画面ページ
│   │           ├── Dashboard.tsx
│   │           ├── PostEditor.tsx
│   │           ├── TagManager.tsx
│   │           ├── ContactList.tsx
│   │           ├── TimesList.tsx
│   │           ├── TimeForm.tsx
│   │           ├── WorkList.tsx
│   │           └── WorkForm.tsx
│   ├── types/
│   │   └── index.ts              # 型定義
│   └── utils/
│       └── date.ts               # 日付フォーマット
├── client/                       # クライアントサイドコード（ブラウザで動くJS）
│   └── src/
│       └── editor.ts             # Milkdownエディタ初期化
├── public/                       # 静的ファイル
│   ├── styles.css                # CSS
│   └── dist/                     # Viteビルド出力（editor.js等）
├── docs/                         # ドキュメント
├── supabase/
│   └── migrations/               # DBマイグレーションSQL
├── wrangler.toml                 # Cloudflare Workers設定
├── vite.config.ts                # Viteビルド設定
├── tsconfig.json                 # TypeScript設定
└── package.json                  # npm設定・スクリプト
```

## リクエストの流れ

ユーザーがページにアクセスしてからHTMLが返るまでの全体像。

```
ブラウザ: GET /blog/my-post
    ↓
Cloudflare Workers（src/index.ts）
    ↓
[1] app.use('*', cors())              全リクエストにCORS適用
    ↓
[2] app.use('*', securityHeaders)     全リクエストにセキュリティヘッダー適用
    ↓
[3] app.route('/', publicRoutes)      ルーティング（routes/public.tsx）
    ↓
[4] ルートハンドラ実行
    │  const supabase = createSupabaseClient(c.env)    ← Supabaseクライアント作成
    │  const { data: post } = await supabase           ← DBからデータ取得
    │    .from('posts')
    │    .select('*, post_tags(tags(*))')
    │    .eq('slug', 'my-post')
    │    .single()
    ↓
[5] return c.html(<BlogPost post={post} />)
    │  └─ BlogPost（JSXコンポーネント）
    │      └─ BaseLayout（HTMLの骨格）
    │          ├─ <head>: meta, CSS, OGP
    │          ├─ <Header />: ナビゲーション
    │          ├─ <main>: 記事本文
    │          ├─ <Footer />
    │          └─ Cloudflare Analytics
    ↓
[6] Hono JSX → HTML文字列に変換
    ↓
[7] securityHeadersの await next() 以降が実行
    │  レスポンスにセキュリティヘッダーを追加
    ↓
ブラウザ: HTMLを受信して表示
```

## ミドルウェアの仕組み

Honoのミドルウェアは `await next()` を境に「前処理」と「後処理」に分かれる。

```typescript
async function middleware(c, next) {
  // ──── 前処理 ────
  // リクエストを受けた直後に実行
  // 例: 認証チェック、リクエスト検証

  await next();  // ← ルートハンドラ（ページ生成）を実行

  // ──── 後処理 ────
  // レスポンスが作られた後に実行
  // 例: ヘッダー追加、ログ出力
}
```

### auth.ts（前処理型）
```
リクエスト → [トークン確認] → 有効？ → next() → ページ表示
                              ↓ 無効
                          リフレッシュ試行 → 成功？ → next()
                                            ↓ 失敗
                                        /admin/login にリダイレクト
```

### security.ts（後処理型）
```
リクエスト → next()（ページ処理） → [レスポンスにヘッダー追加] → ブラウザへ
```

## ルーティング構成

### index.ts（エントリポイント）
3つのルートモジュールをマウントする。

```typescript
app.route('/', publicRoutes);    // 公開ページ
app.route('/admin', adminRoutes); // 管理画面（authMiddleware付き）
app.route('/api', apiRoutes);    // API
```

### routes/public.tsx — 公開ページ
| パス | 処理 |
|-----|------|
| `GET /` | Home — 最新記事3件、Work3件、Times3件を表示 |
| `GET /about` | About — 経歴ページ |
| `GET /work` | Work一覧 — 全Workをdisplay_order順で表示 |
| `GET /work/:slug` | Work詳細 — slugで検索 |
| `GET /blog` | ブログ一覧 — タグフィルタ対応 |
| `GET /blog/:slug` | ブログ記事 — Markdown→HTML変換、閲覧数+1 |
| `GET /contact` | お問い合わせフォーム |
| `POST /contact` | フォーム送信 → Supabaseに保存 |
| `GET /times` | Times一覧 |
| `GET /sitemap.xml` | サイトマップ自動生成 |
| `GET /robots.txt` | robots.txt |

### routes/admin.tsx — 管理画面
全ルートに `authMiddleware` 適用。

| パス | 処理 |
|-----|------|
| `GET /admin` | ダッシュボード（記事一覧） |
| `GET /admin/login` | ログインフォーム |
| `GET /admin/posts/new` | 新規記事作成 |
| `GET /admin/posts/:id/edit` | 記事編集 |
| `GET /admin/tags` | タグ管理 |
| `GET /admin/contacts` | お問い合わせ一覧 |
| `GET /admin/times` | Times管理 |
| `GET /admin/works` | Work管理 |
| `GET /admin/works/new` | Work新規作成 |
| `GET /admin/works/:id/edit` | Work編集 |

### routes/api.ts — API
| パス | メソッド | 認証 | 処理 |
|-----|---------|------|------|
| `/api/auth/login` | POST | 不要 | ログイン |
| `/api/auth/logout` | POST | 不要 | ログアウト |
| `/api/upload/image` | POST | 必要 | 画像アップロード（Supabase Storage） |
| `/api/posts` | POST | 必要 | 記事作成 |
| `/api/posts/:id` | POST/PUT | 必要 | 記事更新 |
| `/api/posts/:id` | DELETE | 必要 | 記事削除 |
| `/api/tags` | POST | 必要 | タグ作成 |
| `/api/tags/:id` | POST/DELETE | 必要 | タグ削除 |
| `/api/contacts/:id/read` | POST/PATCH | 必要 | 既読マーク |
| `/api/times` | GET | 不要 | Times取得 |
| `/api/times` | POST | 必要 | Times作成 |
| `/api/times/:id` | DELETE | 必要 | Times削除 |
| `/api/works` | POST | 必要 | Work作成 |
| `/api/works/:id` | PUT | 必要 | Work更新 |
| `/api/works/:id` | DELETE | 必要 | Work削除 |

## JSXコンポーネントの構造

Hono JSXはReactではなく、サーバーサイドでHTMLを生成するテンプレートエンジン。

```
BaseLayout（HTML骨格: <html><head><body>）
├── <head>
│   ├── meta（title, description, OGP, Twitter Card）
│   ├── <link rel="stylesheet" href="/styles.css" />
│   └── SEO関連タグ
├── <body>
│   ├── <Header />（ナビゲーション + ハンバーガーメニュー）
│   ├── <main>
│   │   └── {children}（各ページの中身）
│   ├── <Footer />
│   └── <script>（Cloudflare Analytics）
```

### Reactとの違い
| | React | Hono JSX |
|---|---|---|
| 実行場所 | ブラウザ | サーバー（Workers） |
| 状態管理 | useState, Redux等 | なし（毎回HTML生成） |
| イベント | onClick等 | インラインscript or なし |
| 出力 | 仮想DOM → DOM操作 | HTML文字列 |
| ファイル拡張子 | .tsx | .tsx（同じだが別物） |

## Supabaseとの連携

### 2つのクライアント

```
createSupabaseClient(env)        ← ANON_KEY使用
├── 公開データの読み取り
├── RLS（Row Level Security）が適用される
└── 例: 公開済み記事の取得、タグ一覧

createSupabaseAdminClient(env)   ← SERVICE_ROLE_KEY使用
├── RLSをバイパス（全データにアクセス可能）
├── 管理操作に使用
└── 例: 記事CRUD、お問い合わせ保存、画像アップロード
```

### データ取得パターン

```typescript
// 1. 単純な取得
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false });

// 2. リレーション付き取得（JOINに相当）
const { data } = await supabase
  .from('posts')
  .select('*, post_tags(tags(*))')  // posts → post_tags → tags を結合
  .eq('status', 'published');

// 3. 単一レコード取得
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', 'my-post')
  .single();                         // 1件だけ返す

// 4. 挿入
const { error } = await supabase
  .from('posts')
  .insert({ title, slug, content, status })
  .select()
  .single();

// 5. 更新
const { error } = await supabase
  .from('posts')
  .update({ title, content })
  .eq('id', postId);

// 6. 削除
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

## 型定義とDBテーブルの対応

```
TypeScript型        → DBテーブル         → 主なカラム
─────────────────────────────────────────────────────
Post               → posts              → id, title, slug, content, status, published_at, view_count
Tag                → tags               → id, name, slug
PostTag            → post_tags          → post_id, tag_id（多対多の中間テーブル）
Contact            → contacts           → id, name, email, message, is_read
Work               → works              → id, title, slug, description, technologies[], display_order
Time               → times              → id, content（280文字以内）, image_url, author_id
User               → auth.users         → Supabase Auth管理
Bindings           → （なし）            → Cloudflare Workers環境変数
```

### リレーション

```
posts ←→ tags（多対多）
  └── post_tags（中間テーブル: post_id + tag_id）

posts.author_id → auth.users.id
times.author_id → auth.users.id
```

## クライアントサイドJS

ブラウザで動くJSは最小限。ほとんどのページはサーバーサイドレンダリング。

### Milkdownエディタ（管理画面のみ）
```
client/src/editor.ts
    ↓ Viteでビルド
public/dist/editor.js
    ↓ PostEditor.tsxの<script>で読み込み
ブラウザでWYSIWYGエディタを初期化
```

**機能:**
- Markdownのリアルタイムプレビュー編集
- 画像ドラッグ&ドロップアップロード（→ Supabase Storage）
- コードブロックのシンタックスハイライト（CodeMirror）

### ハンバーガーメニュー（Header.tsx）
```html
<script>
  toggle.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
  });
</script>
```
インラインスクリプトで実装。フレームワーク不要な簡易な処理。

## npmスクリプト

```bash
npm run dev          # ローカル開発（ビルド → wrangler dev）
npm run dev:watch    # ファイル監視付きローカル開発
npm run build:client # クライアントJSビルド（Vite）
npm run deploy       # 本番デプロイ（ビルド → wrangler deploy）
npm run type-check   # TypeScript型チェック
```

## 設定ファイル

### wrangler.toml
```toml
name = "oneamlog"            # Workers名
main = "src/index.ts"        # エントリポイント
assets = { directory = "./public" }  # 静的ファイル配信
```

### tsconfig.json
```json
"jsx": "react-jsx",
"jsxImportSource": "hono/jsx"    // ← ReactではなくHonoのJSXを使う
```

### vite.config.ts
```typescript
input: { editor: 'client/src/editor.ts' }  // エディタのみビルド
outDir: '../public/dist'                     // 出力先
```

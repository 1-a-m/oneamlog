# 開発ガイド

## 開発環境のセットアップ

### 必要なツール

- **Node.js**: v18 以上
- **npm**: v9 以上（Node.jsに付属）
- **Git**: バージョン管理
- **VSCode**（推奨）: エディタ

### VSCode 推奨拡張機能

- **ESLint**: コードの静的解析
- **Prettier**: コードフォーマッター
- **TypeScript Vue Plugin (Volar)**: TypeScript サポート
- **Tailwind CSS IntelliSense**（将来的に使用する場合）

### プロジェクトのクローン

```bash
git clone <repository-url>
cd oneamlog
npm install
```

### 環境変数の設定

`.dev.vars` ファイルを作成：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (JWT形式)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (JWT形式)
```

### 開発サーバーの起動

```bash
npm run dev
```

http://127.0.0.1:8787 でアクセス可能。

## プロジェクト構成

### ディレクトリ構成の詳細

```
src/
├── index.ts                    # アプリケーションのエントリーポイント
│                               # 各ルートモジュールを統合
├── routes/
│   ├── public.tsx              # 公開サイトのルート定義
│   │                           # GET /, /about, /work, /blog, /contact
│   ├── admin.tsx               # 管理画面のルート定義
│   │                           # GET /admin/*, 認証ミドルウェア適用
│   └── api.ts                  # REST API のルート定義
│                               # POST /api/*, JSON レスポンス
├── middleware/
│   └── auth.ts                 # 認証ミドルウェア
│                               # Cookie から JWT トークンを取得・検証
├── lib/
│   ├── supabase.ts             # Supabase クライアント初期化
│   │                           # createSupabaseClient(), createSupabaseAdminClient()
│   ├── validation.ts           # データバリデーション
│   │                           # validatePost(), validateTag(), validateContact()
│   └── markdown.ts             # Markdown → HTML パース
│                               # marked + DOMPurify で安全に変換
├── types/
│   └── index.ts                # TypeScript 型定義
│                               # Post, Tag, Work, Contact, Bindings
├── views/
│   ├── layouts/
│   │   ├── BaseLayout.tsx      # 公開サイト用レイアウト
│   │   │                       # <html>, <head>, <body>, Header, Footer
│   │   └── AdminLayout.tsx     # 管理画面用レイアウト
│   │                           # サイドバー、メインコンテンツエリア
│   ├── pages/
│   │   ├── Home.tsx            # ホームページ
│   │   ├── About.tsx           # About ページ
│   │   ├── Contact.tsx         # お問い合わせページ
│   │   ├── Work.tsx            # 実績一覧ページ
│   │   ├── BlogList.tsx        # ブログ一覧ページ
│   │   ├── BlogPost.tsx        # ブログ記事詳細ページ
│   │   └── admin/
│   │       ├── Login.tsx       # ログインページ
│   │       ├── Dashboard.tsx   # ダッシュボード
│   │       ├── PostEditor.tsx  # 記事エディタ
│   │       └── TagManager.tsx  # タグマネージャー
│   └── components/
│       ├── Header.tsx          # ヘッダーコンポーネント
│       ├── Footer.tsx          # フッターコンポーネント
│       ├── BlogCard.tsx        # ブログカードコンポーネント
│       └── TagBadge.tsx        # タグバッジコンポーネント
└── utils/
    └── date.ts                 # 日付フォーマット関数
```

## コーディング規約

### TypeScript

- **型定義**: すべての関数、変数に型を明示
- **Interface vs Type**: データ構造には `interface` を使用
- **Enum**: 定数グループには `enum` を使用
- **null vs undefined**: 基本的に `undefined` を使用

```typescript
// Good
interface Post {
  id: string;
  title: string;
  content: string;
}

function getPost(id: string): Post | undefined {
  // ...
}

// Bad
function getPost(id) {
  // ...
}
```

### Hono JSX

- **コンポーネント名**: PascalCase（例: `BlogCard`, `Header`）
- **Props**: interface で型定義
- **ファイル名**: コンポーネント名と同じ（例: `BlogCard.tsx`）

```tsx
// Good
interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <div class="blog-card">
      <h2>{post.title}</h2>
    </div>
  );
}

// Bad
export function blogCard(props: any) {
  return <div>{props.post.title}</div>;
}
```

### CSS

- **クラス名**: kebab-case（例: `blog-card`, `hero-subtitle`）
- **CSS Variables**: カラー、スペーシングは変数で管理
- **ネスト**: 深くネストしない（最大3階層）

```css
/* Good */
.blog-card {
  background-color: var(--color-bg-card);
  padding: var(--spacing-lg);
}

.blog-card:hover {
  transform: translateY(-4px);
}

/* Bad */
.blog-card div .title h2 span {
  color: red;
}
```

### ファイル・ディレクトリ命名

- **ファイル名**: PascalCase（コンポーネント）、camelCase（ユーティリティ）
- **ディレクトリ名**: lowercase

```
Good:
- components/Header.tsx
- lib/supabase.ts
- utils/date.ts

Bad:
- Components/header.tsx
- Lib/Supabase.ts
```

## 開発フロー

### 1. 新機能の開発

```bash
# 新しいブランチを作成
git checkout -b feature/new-feature

# コードを変更
# ...

# 変更をステージング
git add .

# コミット
git commit -m "feat: add new feature"

# プッシュ
git push origin feature/new-feature
```

### 2. コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に従う：

```
feat: 新機能
fix: バグ修正
docs: ドキュメント変更
style: コードスタイルの変更（機能に影響なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルドプロセスやツールの変更
```

例：
```
feat: add work page
fix: resolve supabase key error
docs: update deployment guide
```

### 3. コードレビュー

プルリクエストを作成し、レビューを依頼。

```bash
# GitHub でプルリクエストを作成
gh pr create --title "feat: add work page" --body "Add work page with projects display"
```

## デバッグ

### ローカル開発でのデバッグ

Wrangler の開発サーバーはホットリロードに対応しているため、コードを変更すると自動的にリロードされます。

```bash
npm run dev
```

**ログ確認:**

```typescript
// console.log でログ出力
console.log('Debug:', data);

// エラーログ
console.error('Error:', error);
```

ログは開発サーバーのターミナルに表示されます。

### 本番環境でのデバッグ

Cloudflare Dashboard の **Logs** → **Real-time Logs** でリアルタイムログを確認。

または、Wrangler でログをストリーミング：

```bash
npx wrangler tail
```

## テスト

現在、自動テストは実装されていませんが、以下のようなテストを追加することを推奨：

### ユニットテスト（Vitest）

```bash
npm install -D vitest
```

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

`src/lib/__tests__/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { validatePost } from '../validation';

describe('validatePost', () => {
  it('should validate a valid post', () => {
    const result = validatePost({
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content',
      status: 'draft',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid post', () => {
    const result = validatePost({
      title: '',
      slug: 'test',
      content: '',
      status: 'invalid',
    });

    expect(result.success).toBe(false);
  });
});
```

### E2Eテスト（Playwright）

```bash
npm install -D @playwright/test
```

`tests/e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('home page displays correctly', async ({ page }) => {
  await page.goto('http://localhost:8787');
  await expect(page.locator('h1')).toContainText('Welcome to oneamlog');
});
```

## パフォーマンス最適化

### 1. データベースクエリ最適化

- 必要なカラムのみ SELECT
- 適切なインデックスを使用
- N+1 問題を避ける

```typescript
// Good - 必要なカラムのみ
const { data } = await supabase
  .from('posts')
  .select('id, title, slug, published_at')
  .eq('status', 'published');

// Bad - 全カラム取得
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published');
```

### 2. レスポンスサイズの削減

- 画像の最適化（WebP形式、適切なサイズ）
- CSS の圧縮
- 不要なコメントの削除

### 3. キャッシング

Cloudflare Workers の Cache API を使用：

```typescript
const cache = caches.default;
const cacheKey = new Request(url, { method: 'GET' });

// キャッシュチェック
let response = await cache.match(cacheKey);

if (!response) {
  // キャッシュミス、データを取得
  response = await fetch(url);

  // キャッシュに保存（1時間）
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=3600');

  response = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(cacheKey, response.clone());
}

return response;
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. "Module not found" エラー

**原因:** インポートパスが間違っている

**解決方法:**
```typescript
// Bad
import { Post } from '../types';

// Good - ファイル名まで指定
import { Post } from '../types/index';
```

#### 2. Supabase 接続エラー

**原因:** 環境変数が正しく設定されていない

**解決方法:**
1. `.dev.vars` ファイルを確認
2. JWT 形式のキーを使用しているか確認
3. 開発サーバーを再起動

#### 3. スタイルが反映されない

**原因:** CSS ファイルのパスが間違っている、またはキャッシュ

**解決方法:**
1. `public/styles.css` が存在するか確認
2. ブラウザのキャッシュをクリア（Ctrl + Shift + R）
3. 開発サーバーを再起動

## 貢献ガイドライン

このプロジェクトに貢献する際は、以下のガイドラインに従ってください：

1. **Issue の作成**: バグ報告や機能提案は Issue で行う
2. **ブランチの作成**: `feature/`, `fix/`, `docs/` などの接頭辞を使用
3. **コミットメッセージ**: Conventional Commits に従う
4. **プルリクエスト**: 変更内容を明確に記載
5. **コードレビュー**: レビューのフィードバックに対応

## リソース

- **Hono**: https://hono.dev/
- **Supabase**: https://supabase.com/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Markdown Guide**: https://www.markdownguide.org/

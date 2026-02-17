# デプロイガイド

## 前提条件

- Node.js v18 以上
- npm または yarn
- Cloudflare アカウント
- Supabase アカウント

## 初回セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd oneamlog
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabase プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 新規プロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Project URL
   - anon public key（JWT形式: `eyJh...`）
   - service_role key（JWT形式: `eyJh...`）

### 4. データベースのセットアップ

#### 方法1: Supabase Dashboard（推奨）

1. Supabase Dashboard の **SQL Editor** を開く
2. `supabase/migrations/001_initial_schema.sql` の内容をコピー&ペースト
3. **Run** をクリック
4. `supabase/migrations/002_add_works_table.sql` も同様に実行

#### 方法2: Supabase CLI

```bash
# Supabase CLI をインストール
npm install -g supabase

# Supabase プロジェクトにリンク
supabase link --project-ref <your-project-ref>

# マイグレーションを適用
supabase db push
```

### 5. 管理者ユーザーの作成

Supabase Dashboard の **Authentication** → **Users** から、管理者用のユーザーを作成：

- Email: `admin@example.com`（任意のメールアドレス）
- Password: 安全なパスワード

## ローカル開発

### 環境変数の設定

`.dev.vars` ファイルを作成（既に存在する場合は編集）：

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (JWT形式のanon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (JWT形式のservice_role key)
```

**重要:** `.dev.vars` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

### 開発サーバーの起動

```bash
npm run dev
```

このコマンドは以下を実行します：
1. Viteでクライアントコード（Milkdown エディタ等）をビルド → `public/dist/`
2. Wranglerで開発サーバーを起動

サーバーが起動したら、http://127.0.0.1:8787 にアクセス。

**注意:** クライアントコードを変更した場合は、Viteを再ビルドする必要があります：

```bash
npm run build:client
```

または、ウォッチモードで開発（ファイル変更を自動検出）：

```bash
npm run dev:watch
```

### 管理画面へのアクセス

1. http://127.0.0.1:8787/admin/login にアクセス
2. Supabase で作成した管理者アカウントでログイン
3. http://127.0.0.1:8787/admin でダッシュボードにアクセス

## 本番環境へのデプロイ

### 1. Cloudflare へのログイン

```bash
npx wrangler login
```

ブラウザが開き、Cloudflare アカウントでログインします。

### 2. 環境変数（Secrets）の設定

本番環境の環境変数を Wrangler Secrets として設定：

```bash
# Supabase URL を設定
npx wrangler secret put SUPABASE_URL
# プロンプトが表示されたら、Supabase Project URL を入力
# 例: https://cmlabrdljgxzomulfrez.supabase.co

# Supabase ANON KEY を設定
npx wrangler secret put SUPABASE_ANON_KEY
# プロンプトが表示されたら、JWT形式のanon keyを入力
# 例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase SERVICE ROLE KEY を設定
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# プロンプトが表示されたら、JWT形式のservice_role keyを入力
# 例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意:** 新しいSupabase API key形式（`sb_publishable_...`, `sb_secret_...`）は使用できません。必ず JWT 形式のキーを使用してください。

### 3. wrangler.toml の確認

`wrangler.toml` を開き、以下を確認：

```toml
name = "oneamlog"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Assets (static files)
assets = { directory = "./public", binding = "ASSETS" }

# ローカル開発用のポート設定
[dev]
port = 8787
```

プロジェクト名（`name`）は Cloudflare Workers のサブドメインになります（例: `oneamlog.workers.dev`）。

**重要:** `assets` セクションで `./public` ディレクトリを指定しています。このディレクトリには、Viteでビルドされた `public/dist/` も含まれます。

### 4. デプロイ実行

**重要:** 以下のコマンドを使用してください（Viteビルドを含む）：

```bash
npm run deploy
```

このコマンドは以下を実行します：
1. **Viteでクライアントコードをビルド** (`npm run build:client`)
   - `client/src/editor.ts` → `public/dist/editor.js`
   - Milkdown Crepe エディタのバンドル
   - CodeMirror シンタックスハイライト
   - その他の依存関係
2. **Wranglerでデプロイ** (`wrangler deploy`)
   - サーバーコード (`src/`) をデプロイ
   - 静的アセット (`public/`) をデプロイ（Viteビルド成果物を含む）

**⚠️ 注意:** `npx wrangler deploy` だけでは不十分です。Viteビルドがスキップされ、エディタが動作しません。必ず `npm run deploy` を使用してください。

デプロイが完了すると、以下のようなメッセージが表示されます：

```
> oneamlog@1.0.0 build:client
> vite build

✓ built in 4.28s

✨  Built successfully!
✨  Uploaded oneamlog (X.XX sec)
✨  Published oneamlog (X.XX sec)
   https://oneamlog.workers.dev
```

## ビルドプロセスの詳細

oneamlog は、サーバーサイド（Hono）とクライアントサイド（Vite）の2つのビルドプロセスを使用します：

### サーバーサイド（Hono / Cloudflare Workers）

- **ソース**: `src/` ディレクトリ
- **ビルドツール**: Wrangler（自動）
- **成果物**: Cloudflare Workers にデプロイされる
- **内容**:
  - ルーティング (`src/routes/`)
  - ミドルウェア (`src/middleware/`)
  - Hono JSX コンポーネント (`src/views/`)
  - Supabase クライアント (`src/lib/`)

### クライアントサイド（Vite）

- **ソース**: `client/src/` ディレクトリ
- **ビルドツール**: Vite
- **成果物**: `public/dist/` ディレクトリ
- **内容**:
  - Milkdown Crepe エディタ (`client/src/editor.ts`)
  - CodeMirror シンタックスハイライト
  - その他のクライアント依存関係

**ビルドフロー:**

```
1. npm run build:client
   ↓
   client/src/editor.ts → public/dist/editor.js (バンドル、最適化)
   ↓
2. npm run deploy (または wrangler deploy)
   ↓
   src/ + public/ → Cloudflare Workers
```

**重要:** `public/dist/` は `.gitignore` に含まれているため、デプロイ前に必ず `npm run build:client` を実行してください。

### 5. カスタムドメインの設定（オプション）

Cloudflare Dashboard でカスタムドメインを設定：

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にアクセス
2. **Workers & Pages** → **oneamlog** を選択
3. **Settings** → **Domains & Routes** → **Add** をクリック
4. カスタムドメイン（例: `oneamlog.com`）を入力
5. DNS レコードが自動的に追加されます

### 6. デプロイ確認

デプロイされたURLにアクセスして、以下を確認：

**公開サイト:**
- [ ] ホームページが表示される
- [ ] ブログページが表示される
- [ ] Workページが表示される
- [ ] お問い合わせフォームが動作する

**管理画面:**
- [ ] 管理画面にログインできる (`/admin/login`)
- [ ] ダッシュボードが表示される (`/admin`)
- [ ] **Milkdown Crepe エディタが正常に動作する** (`/admin/posts/new`)
  - [ ] WYSIWYGエディタが表示される
  - [ ] ツールバー（太字、斜体、リスト等）が動作する
  - [ ] Markdownソーストグルボタンが動作する
  - [ ] 画像ドラッグ&ドロップが動作する
  - [ ] リアルタイムプレビューが動作する
- [ ] 記事の作成・編集・削除ができる
- [ ] タグの作成・削除ができる

**エディタが動作しない場合:**
1. ブラウザの開発者ツールで `/dist/editor.js` が正常に読み込まれているか確認
2. `npm run build:client` を実行したか確認
3. `public/dist/` ディレクトリが存在するか確認

## 環境変数の管理

### ローカル開発

`.dev.vars` ファイルで管理。

### 本番環境

Wrangler Secrets で管理。更新する場合：

```bash
# 特定のシークレットを更新
npx wrangler secret put SUPABASE_ANON_KEY

# すべてのシークレットを確認
npx wrangler secret list
```

**注意:** Wrangler Secrets は暗号化されており、一度設定すると値を確認できません。更新する場合は再度 `put` コマンドを実行してください。

## CI/CD（GitHub Actions）

GitHub Actions を使用した自動デプロイの設定例：

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build client-side code (Vite)
        run: npm run build:client

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**重要な変更点:**

- **`npm run build:client` ステップを追加**: Viteでクライアントコード（Milkdown エディタ等）をビルドします。このステップを忘れると、エディタが動作しません。

**必要な設定:**

1. Cloudflare API Token を取得
2. GitHub リポジトリの **Settings** → **Secrets and variables** → **Actions** で `CLOUDFLARE_API_TOKEN` を追加
3. Wrangler Secrets（`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`）は事前に設定しておく必要があります

## トラブルシューティング

### エラー: "supabaseKey is required"

**原因:** 環境変数が正しく設定されていない、または新しい形式のキーを使用している。

**解決方法:**

1. Supabase Dashboard で JWT 形式のキー（`eyJh...` で始まる）を確認
2. 新しい形式（`sb_publishable_...`, `sb_secret_...`）ではなく、従来のJWT形式を使用
3. Wrangler Secrets を再設定：
   ```bash
   npx wrangler secret put SUPABASE_ANON_KEY
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

### デプロイ後にページが表示されない

1. Cloudflare Dashboard でデプロイログを確認
2. ブラウザの開発者ツールでエラーを確認
3. Wrangler Secrets が正しく設定されているか確認：
   ```bash
   npx wrangler secret list
   ```

### ローカル開発サーバーが起動しない

1. `.dev.vars` ファイルが存在し、正しい値が設定されているか確認
2. Node.js のバージョンを確認（v18以上が必要）
3. `node_modules` を削除して再インストール：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### エディタが表示されない / 動作しない

**症状:** 管理画面で記事編集画面を開いても、エディタが表示されない。

**原因:** Viteビルドが実行されていない、または `public/dist/` が存在しない。

**解決方法:**

1. クライアントコードをビルド：
   ```bash
   npm run build:client
   ```

2. `public/dist/editor.js` が存在するか確認：
   ```bash
   ls -la public/dist/
   ```

3. ブラウザの開発者ツールで確認：
   - **Console**: `window.initMilkdownEditor is not a function` エラーがないか
   - **Network**: `/dist/editor.js` が正常に読み込まれているか（200 OK）

4. デプロイ時は `npm run deploy` を使用（`npx wrangler deploy` だけでは不十分）

### Vite ビルドエラー

**症状:** `npm run build:client` がエラーで失敗する。

**解決方法:**

1. キャッシュをクリア：
   ```bash
   rm -rf node_modules/.vite
   ```

2. TypeScript エラーの確認：
   ```bash
   npm run type-check
   ```

3. 依存関係の再インストール：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## ロールバック

デプロイに問題がある場合、Cloudflare Dashboard から以前のバージョンにロールバックできます：

1. Cloudflare Dashboard の **Workers & Pages** → **oneamlog** を選択
2. **Deployments** タブを開く
3. 以前のデプロイメントの **Actions** → **Rollback** をクリック

## モニタリング

### Cloudflare Analytics

Cloudflare Dashboard の **Analytics & Logs** タブで以下を確認できます：

- リクエスト数
- レスポンスタイム
- エラー率
- CPU使用時間

### Supabase Dashboard

Supabase Dashboard の **Reports** タブで以下を確認できます：

- データベースクエリ数
- ストレージ使用量
- 認証アクティビティ

## コスト管理

### Cloudflare Workers 無料枠

- **リクエスト数**: 100,000 req/日
- **CPU時間**: 10ms/リクエスト

現在の使用量は Cloudflare Dashboard で確認できます。

### Supabase 無料枠

- **データベース**: 500MB
- **ストレージ**: 1GB
- **認証**: 50,000 MAU

現在の使用量は Supabase Dashboard の **Settings** → **Billing** で確認できます。

## セキュリティのベストプラクティス

1. **環境変数の保護**
   - `.dev.vars` を Git にコミットしない
   - Wrangler Secrets を使用して本番環境の環境変数を管理

2. **Supabase キーの管理**
   - `service_role` キーは絶対にクライアントサイドで使用しない
   - `anon` キーのみを公開サイトで使用

3. **RLS（Row Level Security）の有効化**
   - すべてのテーブルで RLS を有効化
   - 適切なポリシーを設定

4. **定期的なアップデート**
   - 依存関係を定期的に更新
   - セキュリティパッチを適用

```bash
# 依存関係のアップデート
npm update
npm audit fix
```

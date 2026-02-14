# デプロイガイド

このガイドでは、oneamlog を Cloudflare Workers/Pages にデプロイする手順を説明します。

## 前提条件

- Node.js 18.x 以上がインストールされている
- Cloudflare アカウントを持っている
- Supabase プロジェクトが作成済み
- Git がインストールされている

## 1. Cloudflare へのログイン

```bash
npx wrangler login
```

ブラウザが開くので、Cloudflare アカウントでログインして認証します。

## 2. Supabase の設定

### 2.1 Supabase プロジェクトの作成

1. https://supabase.com/dashboard にアクセス
2. 新しいプロジェクトを作成
3. データベースパスワードを設定（安全な場所に保存）

### 2.2 マイグレーションの適用

```bash
# Supabase CLI をインストール（Windowsの場合）
# オプション1: winget（推奨）
winget install Supabase.CLI

# オプション2: npx で実行（インストール不要）
# 以下のコマンドで "supabase" を "npx supabase" に置き換えて実行

# Supabase にログイン
npx supabase login

# プロジェクトとリンク
npx supabase link --project-ref YOUR_PROJECT_REF

# マイグレーションを適用
npx supabase db push
```

### 2.3 管理者ユーザーの作成

1. Supabase Dashboard → Authentication → Users
2. "Add User" をクリック
3. メールアドレスとパスワードを設定

### 2.4 API キーの取得

Supabase Dashboard → Settings → API で以下の値を取得:

- `Project URL`: `https://xxxxx.supabase.co`
- `anon public` キー: 公開 API キー
- `service_role` キー: サービスロールキー（**秘密情報**）

## 3. Cloudflare Workers へのデプロイ

### 3.1 環境変数（Secrets）の設定

```bash
# Supabase URL を設定
npx wrangler secret put SUPABASE_URL
# 入力: https://xxxxx.supabase.co

# Supabase Anon Key を設定
npx wrangler secret put SUPABASE_ANON_KEY
# 入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key を設定
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# 入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 wrangler.toml の確認

`wrangler.toml` を開いて、以下の設定を確認:

```toml
name = "oneamlog"  # プロジェクト名（必要に応じて変更）
compatibility_date = "2024-01-01"
main = "src/index.ts"

[build]
command = "npm run build"

# 本番環境
[env.production]
name = "oneamlog"
```

### 3.3 デプロイ実行

```bash
# ビルド & デプロイ
npm run deploy

# または手動で
npx wrangler deploy
```

デプロイが成功すると、以下のような URL が表示されます:

```
Published oneamlog (1.23 sec)
  https://oneamlog.YOUR_SUBDOMAIN.workers.dev
```

## 4. カスタムドメインの設定（オプション）

### 4.1 Cloudflare にドメインを追加

1. Cloudflare Dashboard → Websites → Add a Site
2. ドメイン名を入力
3. DNS レコードをスキャン
4. ネームサーバーを変更（ドメインレジストラで設定）

### 4.2 Workers ルートの設定

1. Cloudflare Dashboard → Workers & Pages
2. デプロイした Worker を選択
3. Settings → Triggers → Custom Domains
4. "Add Custom Domain" をクリック
5. ドメイン名を入力（例: `blog.example.com`）

### 4.3 BaseURL の更新

以下のファイルで `baseUrl` を実際のドメインに変更:

- `src/routes/public.tsx` (sitemap.xml, robots.txt)
- `src/views/pages/BlogPost.tsx` (canonicalUrl)

```typescript
// 変更前
const baseUrl = 'https://oneamlog.pages.dev';

// 変更後
const baseUrl = 'https://blog.example.com';
```

変更後、再デプロイ:

```bash
npm run deploy
```

## 5. デプロイ後の確認

### 5.1 サイトの動作確認

- [ ] トップページが表示される（https://your-domain.com/）
- [ ] About ページが表示される（/about）
- [ ] Contact フォームが動作する（/contact）
- [ ] Blog 一覧が表示される（/blog）
- [ ] 管理画面にログインできる（/admin/login）
- [ ] 記事の作成・編集・削除ができる
- [ ] Sitemap が表示される（/sitemap.xml）
- [ ] Robots.txt が表示される（/robots.txt）

### 5.2 ログの確認

```bash
# リアルタイムログを確認
npx wrangler tail

# または Cloudflare Dashboard で確認
# Workers & Pages → oneamlog → Logs
```

### 5.3 SEO 確認

- Google Search Console にサイトを登録
- Sitemap を送信（https://your-domain.com/sitemap.xml）
- OGP が正しく設定されているか確認（https://www.opengraph.xyz/）

## 6. 継続的デプロイ（CI/CD）

### GitHub Actions の設定例

`.github/workflows/deploy.yml` を作成:

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
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

GitHub リポジトリの Settings → Secrets → Actions で `CLOUDFLARE_API_TOKEN` を設定。

## 7. トラブルシューティング

### エラー: "SUPABASE_URL is not defined"

環境変数が設定されていません。「3.1 環境変数（Secrets）の設定」を参照してください。

### エラー: "Failed to fetch from Supabase"

- Supabase の URL とキーが正しいか確認
- Supabase プロジェクトが起動しているか確認
- RLS ポリシーが正しく設定されているか確認

### 管理画面にログインできない

- Supabase で管理者ユーザーが作成されているか確認
- メールアドレスとパスワードが正しいか確認
- ブラウザの開発者ツールでネットワークエラーを確認

### CSS が反映されない

- `public/styles.css` が正しくデプロイされているか確認
- ブラウザのキャッシュをクリア（Ctrl + Shift + R / Cmd + Shift + R）

## 8. パフォーマンス最適化

### Cloudflare Cache の活用

Cloudflare Workers の Cache API を使ってレスポンスをキャッシュできます。
（将来的に実装予定）

### 画像の最適化

Supabase Storage にアップロードする画像は、事前に圧縮してください:

- https://tinypng.com/
- https://squoosh.app/

### 不要なデータの削除

定期的に古いお問い合わせや下書き記事を削除して、データベースを軽量に保ちます。

## 9. セキュリティ

- `SUPABASE_SERVICE_ROLE_KEY` は**絶対に公開しない**
- Git にコミットしない（`.gitignore` に `.dev.vars` を追加済み）
- Cloudflare Secrets として安全に管理

## 10. コスト

### 無料枠

- **Cloudflare Workers**: 100,000 リクエスト/日
- **Supabase**: 500MB DB, 1GB Storage, 50,000 MAU

個人ブログであれば、**完全無料**で運用可能です。

### 有料プラン（必要に応じて）

- **Cloudflare Workers Paid**: $5/月（10,000,000 リクエスト/月）
- **Supabase Pro**: $25/月（8GB DB, 100GB Storage, 100,000 MAU）

## サポート

問題が発生した場合は、以下を確認してください:

- Cloudflare Workers ドキュメント: https://developers.cloudflare.com/workers/
- Supabase ドキュメント: https://supabase.com/docs
- Hono ドキュメント: https://hono.dev/

---

以上でデプロイは完了です！🎉

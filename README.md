# oneamlog

エンジニアポートフォリオ＆ブログサイト - Cloudflare Workers (Hono) + Supabase による完全サーバーレス構成

## 概要

oneamlog は、インフラエンジニアとしての経歴紹介、技術ブログ、実績紹介、お問い合わせ機能を提供するポートフォリオサイトです。Cloudflare Workers と Supabase を活用し、完全無料で軽量・高速な運用を実現しています。

### 主な機能

- ✅ **ポートフォリオページ**: 経歴、スキル、実績の紹介
- ✅ **ブログ機能**: Markdown で記事を執筆、タグによるフィルタリング
- ✅ **実績一覧（Work）**: プロジェクトの詳細、使用技術、リンク
- ✅ **お問い合わせフォーム**: バリデーション付きフォーム
- ✅ **管理画面**: 認証付き CMS（記事・タグ・実績の CRUD 操作）
- ✅ **ダークテーマ**: Zenn 風のモダンなデザイン
- ✅ **SEO最適化**: Sitemap, Robots.txt, メタタグ

## 技術スタック

### フロントエンド
- **Hono JSX**: サーバーサイドレンダリング
- **CSS Variables**: カスタムプロパティによるスタイリング

### バックエンド
- **Hono v4.0.0**: 軽量・高速な Web フレームワーク
- **Cloudflare Workers**: エッジコンピューティング
- **Supabase**: PostgreSQL データベース + 認証 + ストレージ

### 開発ツール
- **TypeScript v5.3.0**: 型安全な開発
- **Wrangler v4.65.0**: Cloudflare Workers デプロイツール

## クイックスタート

### 前提条件

- Node.js v18 以上
- npm
- Cloudflare アカウント
- Supabase アカウント

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd oneamlog

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .dev.vars
# .dev.vars を編集して Supabase の認証情報を設定

# 開発サーバーを起動
npm run dev
```

http://127.0.0.1:8787 でアクセス可能。

### 環境変数の設定

`.dev.vars` ファイルを作成し、以下を設定：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (JWT形式のanon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (JWT形式のservice_role key)
```

**重要:** 新しい Supabase API key 形式（`sb_publishable_...`, `sb_secret_...`）は使用できません。必ず JWT 形式のキーを使用してください。

### データベースのセットアップ

Supabase Dashboard の SQL Editor で以下のマイグレーションを実行：

```bash
# 1. supabase/migrations/001_initial_schema.sql を実行
# 2. supabase/migrations/002_add_works_table.sql を実行
```

または Supabase CLI を使用：

```bash
supabase db push
```

### 管理者ユーザーの作成

Supabase Dashboard の **Authentication** → **Users** から管理者ユーザーを作成：

- Email: `admin@example.com`
- Password: 安全なパスワード

## 使い方

### 公開サイト

- **Home**: http://127.0.0.1:8787/
- **About**: http://127.0.0.1:8787/about
- **Work**: http://127.0.0.1:8787/work
- **Blog**: http://127.0.0.1:8787/blog
- **Contact**: http://127.0.0.1:8787/contact

### 管理画面

1. http://127.0.0.1:8787/admin/login にアクセス
2. Supabase で作成した管理者アカウントでログイン
3. http://127.0.0.1:8787/admin でダッシュボードにアクセス

**管理機能:**
- 記事の作成・編集・削除
- タグの管理
- 実績の管理
- お問い合わせの確認

## デプロイ

### Cloudflare Workers へのデプロイ

```bash
# Cloudflare にログイン
npx wrangler login

# 環境変数（Secrets）を設定
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# デプロイ
npm run deploy
```

デプロイが完了すると、`https://oneamlog.workers.dev` でアクセス可能になります。

詳細は [docs/deployment.md](docs/deployment.md) を参照してください。

## ドキュメント

- [アーキテクチャ設計](docs/architecture.md) - システム全体の設計
- [データベース設計](docs/database.md) - テーブル定義、RLS、ER図
- [API設計](docs/api.md) - エンドポイント一覧、リクエスト/レスポンス
- [デプロイガイド](docs/deployment.md) - デプロイ手順、環境変数設定
- [開発ガイド](docs/development.md) - 開発フロー、コーディング規約

## プロジェクト構成

```
oneamlog/
├── src/
│   ├── index.ts                    # エントリーポイント
│   ├── routes/                     # ルート定義
│   ├── middleware/                 # ミドルウェア
│   ├── lib/                        # ライブラリ（Supabase、Markdown等）
│   ├── types/                      # TypeScript型定義
│   ├── views/                      # Hono JSX コンポーネント
│   └── utils/                      # ユーティリティ
├── supabase/
│   └── migrations/                 # データベースマイグレーション
├── public/
│   └── styles.css                  # グローバルCSS
├── docs/                           # ドキュメント
├── wrangler.toml                   # Cloudflare Workers設定
└── package.json
```

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# デプロイ
npm run deploy
```

## 無料枠での運用

このプロジェクトは以下の無料枠内で完全に運用可能です：

| サービス | 無料枠 | 想定使用量 |
|---------|--------|-----------|
| Cloudflare Workers | 100,000 req/日 | ~1,000 req/日 |
| Supabase DB | 500MB | ~50MB |
| Supabase Storage | 1GB | ~200MB |
| Supabase Auth | 50,000 MAU | 1 ユーザー |

## ライセンス

MIT

## 作者

oneam - インフラエンジニア

- **Blog**: https://oneamlog.pages.dev/blog
- **GitHub**: https://github.com/oneam

## 貢献

Issue や Pull Request を歓迎します。詳細は [docs/development.md](docs/development.md) の貢献ガイドラインを参照してください。

## サポート

問題が発生した場合は、以下を確認してください：

1. [トラブルシューティング](docs/deployment.md#トラブルシューティング)
2. [GitHub Issues](https://github.com/oneam/oneamlog/issues)
3. [Hono Documentation](https://hono.dev/)
4. [Supabase Documentation](https://supabase.com/docs)

## 今後の予定

- [ ] 検索機能の実装
- [ ] RSS フィードの追加
- [ ] 画像の最適化（自動リサイズ）
- [ ] コメント機能
- [ ] アクセス解析の統合
- [ ] プレビュー機能（ドラフト記事）
- [ ] 自動保存機能

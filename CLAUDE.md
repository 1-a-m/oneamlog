# oneamlog - エンジニアポートフォリオ & ブログ

## 技術スタック
- Hono (Cloudflare Workers)
- Hono JSX（フロントエンド、Reactは使わない）
- Supabase (PostgreSQL + Auth + Storage)
- Cloudflare Pages/Workers でホスティング（無料枠）

## ページ構成
- / - Home（自己紹介・スキル）
- /about - 経歴詳細
- /contact - お問い合わせフォーム → Supabaseに保存
- /blog - ブログ一覧（タグフィルタ付き）
- /blog/:slug - ブログ記事詳細
- /admin/* - 管理画面（Supabase Auth認証付き）

## 管理画面機能
- ブログ記事 CRUD
- タグ管理
- 下書き/公開ステータス管理
- プレビュー
- 画像アップロード（Supabase Storage）

## 開発方針
- 軽量・高速を最優先
- 完全無料運用
- 単一リポジトリで管理
- 日本語でコメント・コミットメッセージ

## コマンド
- `npm run dev` - ローカル開発
- `npm run deploy` - Cloudflareにデプロイ
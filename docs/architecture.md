# oneamlog アーキテクチャ設計書

## 概要

oneamlogは、Cloudflare Workers (Hono) と Supabase を使用した完全サーバーレスのポートフォリオサイトです。エンジニアとしての経歴紹介、ブログ、実績紹介、お問い合わせ機能を提供します。

## 技術スタック

### フロントエンド
- **フレームワーク**: Hono JSX（サーバーサイドレンダリング）
- **スタイリング**: CSS Variables（カスタムプロパティ）
- **テーマ**: Zenn風のダークテーマ

### バックエンド
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono v4.0.0
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage

### 開発ツール
- **言語**: TypeScript v5.3.0
- **デプロイ**: Wrangler v4.65.0
- **パッケージマネージャー**: npm

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Hono)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public Routes│  │ Admin Routes │  │  API Routes  │      │
│  │   (SSR)      │  │   (SSR)      │  │    (JSON)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth        │  │  Storage     │      │
│  │  (RLS)       │  │  (JWT)       │  │  (Images)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
oneamlog/
├── src/
│   ├── index.ts                    # エントリーポイント
│   ├── routes/
│   │   ├── public.tsx              # 公開サイトルート
│   │   ├── admin.tsx               # 管理画面ルート
│   │   └── api.ts                  # REST API
│   ├── middleware/
│   │   └── auth.ts                 # 認証ミドルウェア
│   ├── lib/
│   │   ├── supabase.ts             # Supabaseクライアント
│   │   ├── validation.ts           # バリデーション
│   │   └── markdown.ts             # Markdownパーサー
│   ├── types/
│   │   └── index.ts                # TypeScript型定義
│   ├── views/
│   │   ├── layouts/                # レイアウトコンポーネント
│   │   ├── pages/                  # ページコンポーネント
│   │   └── components/             # 共通コンポーネント
│   └── utils/
│       └── date.ts                 # 日付ユーティリティ
├── supabase/
│   └── migrations/                 # データベースマイグレーション
├── public/
│   └── styles.css                  # グローバルCSS
├── docs/                           # ドキュメント
├── wrangler.toml                   # Cloudflare Workers設定
├── package.json
└── tsconfig.json
```

## 主要機能

### 公開サイト

1. **Home**
   - 自己紹介（インフラエンジニア、1997年生まれ）
   - スキル紹介（フロントエンド、バックエンド、インフラ）
   - 最新のブログ記事（4件表示）
   - 最新の Times 3件（右サイドバーに固定表示）

2. **About**
   - 経歴詳細
   - 技術スタック
   - 興味・関心

3. **Work**
   - 実績一覧（グリッドカードレイアウト）
   - 実績詳細ページ（`/work/:slug`）
   - サムネイル、期間、使用技術、リンク表示

4. **Times**
   - タイムライン形式の短文投稿（最大280文字）
   - 画像添付対応
   - ホームのサイドバーにも表示

5. **Blog**
   - ブログ記事一覧
   - タグフィルタリング
   - 記事詳細（Markdown表示）
   - 閲覧数カウント

6. **Contact**
   - お問い合わせフォーム
   - バリデーション

### 管理画面

1. **認証**
   - Supabase Auth によるログイン
   - JWT トークン認証
   - HttpOnly Cookie でトークン管理

2. **記事管理**
   - 記事の作成・編集・削除
   - ドラフト・公開ステータス
   - タグの紐付け
   - Markdown エディタ

3. **タグ管理**
   - タグの作成・削除
   - スラッグ自動生成

4. **実績管理（Work）**
   - 実績の作成・編集・削除
   - タイトルから slug 自動生成
   - 画像URL、プロジェクトURL、GitHub URL
   - 使用技術（カンマ区切り入力）
   - プロジェクト期間の設定
   - 表示順の設定

5. **Times 管理**
   - 投稿の作成・削除
   - 画像添付対応（Supabase Storage）
   - 文字数カウンター（280文字制限）

6. **お問い合わせ管理**
   - お問い合わせ一覧
   - 既読管理

## セキュリティ

### Row Level Security (RLS)

すべてのテーブルでRLSを有効化：

- **公開データ**（posts, tags, works）: 誰でも読み取り可能、認証済みユーザーのみ編集可能
- **プライベートデータ**（contacts）: 認証済みユーザーのみアクセス可能

### 認証フロー

1. ユーザーが `/admin/login` でメール・パスワードを入力
2. `POST /api/auth/login` で Supabase Auth に認証リクエスト
3. 成功時、`access_token` と `refresh_token` を HttpOnly Cookie に保存
4. `/admin/*` 配下のルートは `authMiddleware` で保護
5. ミドルウェアが Cookie から token を取得し、`supabase.auth.getUser()` で検証

### 環境変数管理

- ローカル開発: `.dev.vars` ファイル
- 本番環境: Wrangler Secrets

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## パフォーマンス最適化

1. **サーバーサイドレンダリング（SSR）**
   - Hono JSX による高速なHTMLレンダリング
   - JavaScriptフレームワーク不使用で軽量

2. **エッジコンピューティング**
   - Cloudflare Workers によるエッジでの実行
   - グローバルに低レイテンシを実現

3. **データベースクエリ最適化**
   - 必要なカラムのみ SELECT
   - インデックスの活用（slug, status, display_order, created_at）

4. **モバイル対応**
   - ハンバーガーメニュー（768px以下）
   - レスポンシブグリッドレイアウト

4. **キャッシング**
   - CSS の 304 Not Modified レスポンス
   - Cloudflare CDN によるキャッシング

## スケーラビリティ

### 無料枠での運用

- **Cloudflare Workers**: 100,000 リクエスト/日
- **Supabase DB**: 500MB
- **Supabase Storage**: 1GB
- **Supabase Auth**: 50,000 MAU

### 想定使用量

- リクエスト: ~1,000 req/日（99%の余裕）
- DB: ~50MB（90%の余裕）
- Storage: ~200MB（80%の余裕）

完全無料で運用可能。

## デプロイメント

### 開発環境

```bash
npm run dev
# http://localhost:8787
```

### 本番環境

```bash
# 環境変数設定
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# デプロイ
npm run deploy
```

デプロイ先: Cloudflare Workers（`https://oneamlog.pages.dev`）

## 今後の拡張案

1. **検索機能**: 全文検索の実装
2. **RSS フィード**: `/feed.xml` の追加
3. **画像最適化**: 自動リサイズ・圧縮
4. **コメント機能**: 記事へのコメント
5. **アクセス解析**: Cloudflare Analytics 統合
6. **プレビュー機能**: ドラフト記事のプレビュー
7. **自動保存**: 記事編集中の自動保存
8. **SEO強化**: OGP画像、構造化データ
9. **Times ページング**: 無限スクロール・ページネーション
10. **Work カテゴリフィルター**: 技術スタックや期間でフィルタリング

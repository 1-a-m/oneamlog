# データベース設計

## スキーマ概要

Supabase PostgreSQL を使用。全テーブルで Row Level Security (RLS) を有効化。

## テーブル一覧

### 1. posts（ブログ記事）

ブログ記事を管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 記事ID（自動生成） |
| title | VARCHAR(255) | NOT NULL | 記事タイトル |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL用スラッグ |
| content | TEXT | NOT NULL | 記事本文（Markdown） |
| excerpt | TEXT | - | 抜粋 |
| status | VARCHAR | NOT NULL | 'draft' または 'published' |
| published_at | TIMESTAMP | - | 公開日時 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |
| author_id | UUID | FK → auth.users | 作成者ID |
| view_count | INTEGER | DEFAULT 0 | 閲覧数 |

**インデックス:**
- `idx_posts_slug` on `slug`
- `idx_posts_status` on `status`
- `idx_posts_published_at` on `published_at`

**RLS ポリシー:**
- 公開済み記事（`status='published'`）は誰でも読み取り可能
- 認証済みユーザー（管理者）は全データの CRUD 可能

### 2. tags（タグ）

ブログ記事のタグを管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | タグID（自動生成） |
| name | VARCHAR(100) | UNIQUE, NOT NULL | タグ名 |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL用スラッグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

**インデックス:**
- `idx_tags_slug` on `slug`

**RLS ポリシー:**
- 誰でも読み取り可能
- 認証済みユーザー（管理者）のみ編集可能

### 3. post_tags（記事とタグの中間テーブル）

記事とタグの多対多リレーションを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| post_id | UUID | FK → posts.id | 記事ID |
| tag_id | UUID | FK → tags.id | タグID |

**主キー:** `(post_id, tag_id)`

**インデックス:**
- `idx_post_tags_post_id` on `post_id`
- `idx_post_tags_tag_id` on `tag_id`

**RLS ポリシー:**
- 誰でも読み取り可能
- 認証済みユーザー（管理者）のみ編集可能

### 4. works（実績）

ポートフォリオの実績を管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 実績ID（自動生成） |
| title | VARCHAR(255) | NOT NULL | プロジェクトタイトル |
| slug | VARCHAR(255) | UNIQUE | URL用スラッグ |
| description | TEXT | NOT NULL | プロジェクト説明 |
| image_url | TEXT | - | 画像URL |
| project_url | TEXT | - | プロジェクトURL |
| github_url | TEXT | - | GitHub リポジトリURL |
| technologies | TEXT[] | - | 使用技術（配列） |
| period | VARCHAR(100) | - | プロジェクト期間（例: "2023年4月 - 2023年6月"） |
| display_order | INTEGER | DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**インデックス:**
- `idx_works_display_order` on `display_order`
- `idx_works_slug` on `slug`

**RLS ポリシー:**
- 誰でも読み取り可能
- 認証済みユーザー（管理者）のみ編集可能

### 5. times（タイムライン投稿）

Twitter/Slack的なつぶやきを管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 投稿ID（自動生成） |
| content | TEXT | NOT NULL, 最大280文字 | 投稿内容 |
| image_url | TEXT | - | 画像URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 投稿日時 |
| author_id | UUID | FK → auth.users | 投稿者ID |

**インデックス:**
- `idx_times_created_at` on `created_at DESC`

**RLS ポリシー:**
- 誰でも読み取り可能
- 認証済みユーザー（管理者）のみ投稿・削除可能

### 6. contacts（お問い合わせ）

お問い合わせ内容を保存するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | お問い合わせID（自動生成） |
| name | VARCHAR(255) | NOT NULL | 名前 |
| email | VARCHAR(255) | NOT NULL | メールアドレス |
| message | TEXT | NOT NULL | メッセージ |
| created_at | TIMESTAMP | DEFAULT NOW() | 送信日時 |
| is_read | BOOLEAN | DEFAULT false | 既読フラグ |

**インデックス:**
- `idx_contacts_created_at` on `created_at`
- `idx_contacts_is_read` on `is_read`

**RLS ポリシー:**
- 認証済みユーザー（管理者）のみアクセス可能
- 公開サイトからの送信は `service_role` キーで実行

## ER図

```
┌─────────────────┐
│     posts       │
│─────────────────│
│ id (PK)         │◄─────┐
│ title           │      │
│ slug (UNIQUE)   │      │
│ content         │      │
│ excerpt         │      │
│ status          │      │
│ published_at    │      │
│ created_at      │      │
│ updated_at      │      │
│ author_id (FK)  │      │
│ view_count      │      │
└─────────────────┘      │
                         │
                         │
                    ┌────┴────────┐
                    │  post_tags  │
                    │─────────────│
                    │ post_id (FK)│
                    │ tag_id (FK) │
                    └────┬────────┘
                         │
                         │
┌─────────────────┐      │
│      tags       │◄─────┘
│─────────────────│
│ id (PK)         │
│ name (UNIQUE)   │
│ slug (UNIQUE)   │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     works       │
│─────────────────│
│ id (PK)         │
│ title           │
│ slug (UNIQUE)   │
│ description     │
│ image_url       │
│ project_url     │
│ github_url      │
│ technologies[]  │
│ period          │
│ display_order   │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│     times       │
│─────────────────│
│ id (PK)         │
│ content         │
│ image_url       │
│ created_at      │
│ author_id (FK)  │
└─────────────────┘

┌─────────────────┐
│    contacts     │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ message         │
│ created_at      │
│ is_read         │
└─────────────────┘
```

## トリガー

### updated_at 自動更新

posts, works テーブルには `updated_at` を自動更新するトリガーを設定。

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at_trigger
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER works_updated_at_trigger
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## マイグレーション

マイグレーションファイルは `supabase/migrations/` に保存。

- `001_initial_schema.sql`: 初期スキーマ（posts, tags, post_tags, contacts）
- `002_add_works_table.sql`: works テーブル追加
- `003_add_times_table.sql`: times テーブル追加
- `004_add_period_to_works.sql`: works テーブルに period カラム追加
- `005_add_slug_to_works.sql`: works テーブルに slug カラム追加

### マイグレーションの適用

```bash
# Supabase CLI
supabase db push

# または Supabase Dashboard の SQL Editor で実行
```

## クエリ例

### 公開済み記事を取得（タグ付き）

```sql
SELECT
  p.*,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'id', t.id,
      'name', t.name,
      'slug', t.slug
    )
  ) FILTER (WHERE t.id IS NOT NULL) as tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.published_at DESC;
```

### タグでフィルタリングした記事を取得

```sql
SELECT DISTINCT p.*
FROM posts p
INNER JOIN post_tags pt ON p.id = pt.post_id
INNER JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
  AND t.slug = 'terraform'
ORDER BY p.published_at DESC;
```

### 実績を表示順に取得

```sql
SELECT *
FROM works
ORDER BY display_order ASC, created_at DESC;
```

### 未読のお問い合わせを取得

```sql
SELECT *
FROM contacts
WHERE is_read = false
ORDER BY created_at DESC;
```

## バックアップとリストア

Supabase は自動バックアップを提供。

- **Point-in-Time Recovery (PITR)**: Pro プラン以上
- **手動バックアップ**: `pg_dump` でエクスポート可能

```bash
# エクスポート
pg_dump -h db.cmlabrdljgxzomulfrez.supabase.co -U postgres > backup.sql

# インポート
psql -h db.cmlabrdljgxzomulfrez.supabase.co -U postgres < backup.sql
```

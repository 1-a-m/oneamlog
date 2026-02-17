# Milkdown Crepe で実現する快適なMarkdownエディタ - 実装までの道のり

## はじめに

ブログCMSを作る上で、記事編集体験は最も重要な要素の一つです。本記事では、oneamlog に Milkdown Crepe WYSIWYG エディタを統合するまでの実装プロセス、直面した課題、そして解決策を共有します。

## 背景：なぜ専用エディタが必要だったのか

### 初期の状態

プロジェクト開始時、記事編集画面は単純な `<textarea>` によるプレーンテキスト入力でした：

```tsx
<textarea
  id="content"
  name="content"
  rows={20}
  placeholder="# 見出し&#10;&#10;本文をMarkdown形式で書きましょう..."
>{post?.content || ''}</textarea>
```

### 課題

この単純なアプローチには、以下の問題がありました：

1. **プレビューが見えない**
   - Markdownで書いているつもりが、実際の表示を確認できない
   - 記事を公開してから「あれ？」と気づくことが多発

2. **Markdown記法の記憶に依存**
   - 「リンクの書き方どうだったっけ？」
   - 「テーブルの区切り文字は？」
   - 毎回ググる手間

3. **画像アップロードが面倒**
   - 別途アップロード → URL取得 → 手動で `![](URL)` を書く
   - 工程が多すぎて執筆の流れが途切れる

4. **モダンなCMSとしての見た目**
   - WordPress、Notion、Qiitaなど、現代的なCMSは皆リッチエディタを持っている
   - `<textarea>` だけでは「手作り感」が否めない

### 理想のエディタ像

これらの課題から、理想のエディタ要件を定義しました：

- ✅ WYSIWYGプレビューで書きながら確認できる
- ✅ Markdown記法を自然にサポート（ツールバーで操作可能）
- ✅ 画像をドラッグ&ドロップでアップロード
- ✅ 軽量で高速（Cloudflare Workersの制約内）
- ✅ カスタマイズ可能（独自スタイル、機能拡張）

## 技術選定：なぜ Milkdown Crepe なのか

### 候補の比較

Markdownエディタのライブラリは数多く存在します。主要な候補を比較検討しました：

| ライブラリ | メリット | デメリット | 評価 |
|-----------|---------|-----------|------|
| **React Markdown Editor** | React統合が簡単 | Reactが必須（Hono JSXでは使えない） | ❌ |
| **SimpleMDE** | 軽量、シンプル | プレビューが分離、WYSIWYGではない | △ |
| **Toast UI Editor** | 高機能、UIがリッチ | バンドルサイズが大きい（~500KB） | △ |
| **Tiptap** | 拡張性抜群 | Markdown専用ではない、設定が複雑 | △ |
| **Milkdown** | Markdown専用、軽量、ProseMirror基盤 | 学習コスト | ○ |
| **Milkdown Crepe** | Milkdown + すぐ使えるUI | 新しい（情報少ない） | ✅ |

### Milkdown Crepe を選んだ理由

最終的に **Milkdown Crepe** を選択した決め手：

1. **フレームワーク非依存**
   - VanillaJSで動作 → Hono JSX (サーバーサイドレンダリング) と相性良好
   - クライアントサイドで独立して初期化可能

2. **WYSIWYG + Markdown のハイブリッド**
   - リアルタイムプレビュー
   - Markdownソースも同時に確認可能（トグル機能で実装）

3. **ProseMirror 基盤**
   - 堅牢な編集エンジン
   - リッチなプラグインエコシステム

4. **すぐ使えるUI (Crepe テーマ)**
   - Milkdown 本体はヘッドレス（UIなし）
   - Crepe = Milkdown + 美しいデフォルトUI
   - ゼロから UI を組む必要がない

5. **バンドルサイズ**
   - 圧縮後 ~440KB（CodeMirror含む）
   - 必要な機能だけを選択可能

## 実装フェーズ1: 環境構築

### Vite ビルドシステムの導入

Hono (Cloudflare Workers) はサーバーサイドのみの環境です。クライアントサイドのJavaScript（Milkdown Crepe）を動かすには、別途ビルドシステムが必要でした。

#### Step 1: Vite のセットアップ

```bash
npm install -D vite
```

`vite.config.ts` を作成：

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'client',  // クライアントコードのルート
  build: {
    outDir: '../public/dist',  // ビルド成果物
    emptyOutDir: true,
    rollupOptions: {
      input: {
        editor: resolve(__dirname, 'client/src/editor.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
```

#### Step 2: ビルドスクリプト

`package.json` に追加：

```json
{
  "scripts": {
    "build:client": "vite build",
    "dev": "npm run build:client && wrangler dev"
  }
}
```

これで、`npm run build:client` で `public/dist/editor.js` が生成されるようになりました。

### Milkdown パッケージのインストール

```bash
npm install @milkdown/crepe \
  @milkdown/core \
  @milkdown/ctx \
  @milkdown/plugin-listener \
  @milkdown/plugin-upload \
  @milkdown/preset-commonmark \
  @milkdown/preset-gfm
```

バージョン: `7.18.0` で統一（バージョン不一致でエラーが出やすいため）

## 実装フェーズ2: エディタコア実装

### client/src/editor.ts の作成

```typescript
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

// 画像アップロード関数
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'アップロードに失敗しました');
  }

  const data = await response.json();
  return data.url;
}

// エディタを初期化する関数
export async function initMilkdownEditor(
  element: HTMLElement,
  initialValue: string,
  onMarkdownChange: (markdown: string) => void
) {
  const crepe = new Crepe({
    root: element,
    defaultValue: initialValue,
    features: {
      [Crepe.Feature.CodeMirror]: true,
      [Crepe.Feature.ListItem]: true,
      [Crepe.Feature.BlockEdit]: true,
      [Crepe.Feature.Placeholder]: true,
      [Crepe.Feature.Cursor]: true,
      [Crepe.Feature.Toolbar]: true,
      [Crepe.Feature.LinkTooltip]: true,
      [Crepe.Feature.Listener]: true,
      [Crepe.Feature.ImageBlock]: {
        onUpload: async (file: File) => {
          try {
            const url = await uploadImage(file);
            return url;
          } catch (error) {
            console.error('Upload failed:', error);
            alert('画像のアップロードに失敗しました: ' + (error as Error).message);
            throw error;
          }
        },
      },
    },
  });

  await crepe.create();

  // Markdownの変更を監視
  crepe.on((listener) => {
    listener.markdownUpdated(() => {
      const markdown = crepe.getMarkdown();
      onMarkdownChange(markdown);
    });
  });

  return crepe;
}

// グローバルに公開
(window as any).initMilkdownEditor = initMilkdownEditor;
```

### 課題1: 同期の仕組みが分からない

**問題**: 初期実装では、ポーリングで `crepe.getMarkdown()` を定期実行していました。

```typescript
// ❌ 非効率なアプローチ
setInterval(() => {
  const markdown = crepe.getMarkdown();
  updateTextarea(markdown);
}, 500);
```

**欠点**:
- CPU負荷が高い
- 変更がない時も無駄に実行
- 500msのラグ

**解決策**: 公式ドキュメントを読み直し、`Crepe.Feature.Listener` の存在を発見。

```typescript
// ✅ イベントドリブンな同期
crepe.on((listener) => {
  listener.markdownUpdated(() => {
    const markdown = crepe.getMarkdown();
    onMarkdownChange(markdown);
  });
});
```

**学び**: ドキュメントをよく読む。公式の Playground コードも参考に。

### 課題2: `[object Object]` が表示される

**問題**: Markdownソーステキストエリアに `[object Object]` と表示される。

**原因**: `listener.markdownUpdated((markdown) => {...})` のコールバック引数 `markdown` はMarkdown文字列ではなく、イベントオブジェクトだった。

```typescript
// ❌ 間違い
listener.markdownUpdated((markdown) => {
  markdownSource.value = markdown;  // [object Object]
});
```

**解決策**: コールバック内で明示的に `crepe.getMarkdown()` を呼ぶ。

```typescript
// ✅ 正解
listener.markdownUpdated(() => {
  const markdown = crepe.getMarkdown();
  markdownSource.value = markdown;
});
```

**学び**: TypeScriptの型定義を確認すべきだった。Crepeの型定義を読めば一目瞭然。

## 実装フェーズ3: UI統合

### PostEditor.tsx への組み込み

サーバーサイドで PostEditor コンポーネントをレンダリングし、クライアントサイドでエディタを初期化：

```tsx
export function PostEditor({ post, allTags, errorMsg }: PostEditorProps) {
  return (
    <AdminLayout title={isEdit ? '記事編集' : '新規記事作成'}>
      <div class="editor-container">
        <form method="POST" action={...}>
          {/* 基本情報 */}
          <input type="text" id="title" name="title" ... />
          <input type="text" id="slug" name="slug" ... />

          {/* エディタ */}
          <div class="editor-split-view" id="editor-container">
            <div class="editor-pane">
              <div id="editor" class="milkdown-editor"></div>
            </div>
            <div class="editor-pane" id="source-pane" style="display: none;">
              <textarea id="markdown-source" readonly></textarea>
            </div>
          </div>

          {/* フォーム送信用（非表示） */}
          <textarea id="content" name="content" style="display: none;">
            {post?.content || ''}
          </textarea>
        </form>
      </div>

      {/* クライアントスクリプト */}
      <script type="module" src="/dist/editor.js"></script>
      <script type="module" dangerouslySetInnerHTML={{__html: `
        (async function() {
          // モジュール読み込み待機
          await new Promise(resolve => {
            if (window.initMilkdownEditor) {
              resolve();
            } else {
              const checkInterval = setInterval(() => {
                if (window.initMilkdownEditor) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
            }
          });

          const contentTextarea = document.getElementById('content');
          const markdownSource = document.getElementById('markdown-source');
          const initialValue = contentTextarea.value || '';

          const editorInstance = await window.initMilkdownEditor(
            document.getElementById('editor'),
            initialValue,
            (markdown) => {
              markdownSource.value = markdown;
              contentTextarea.value = markdown;
            }
          );
        })();
      `}} />
    </AdminLayout>
  );
}
```

### 課題3: モジュール読み込みタイミング

**問題**: `window.initMilkdownEditor is not a function` エラー

**原因**: `<script type="module">` の読み込みが非同期なため、インラインスクリプトが先に実行される。

**解決策**: Promise + setInterval で初期化関数の存在を待機。

```typescript
await new Promise(resolve => {
  const checkInterval = setInterval(() => {
    if (window.initMilkdownEditor) {
      clearInterval(checkInterval);
      resolve();
    }
  }, 100);
});
```

**学び**: モジュールスクリプトの非同期性を理解する。動的インポート (`import()`) も検討したが、シンプルさを優先。

## 実装フェーズ4: UX改善

### トグルボタンによる分割ビュー

当初は常に分割ビュー（WYSIWYG | Markdown）でしたが、エディタ領域が狭いというフィードバックを受けました。

**解決策**: デフォルトは WYSIWYG のみ表示、ボタンでトグル可能に。

```typescript
const toggleBtn = document.getElementById('toggle-source-btn');
const sourcePane = document.getElementById('source-pane');
const editorContainer = document.getElementById('editor-container');
let isSourceVisible = false;

toggleBtn.addEventListener('click', () => {
  isSourceVisible = !isSourceVisible;
  if (isSourceVisible) {
    sourcePane.style.display = 'flex';
    editorContainer.style.gridTemplateColumns = '1fr 1fr';
    toggleBtn.textContent = '✕ Markdown ソース非表示';
  } else {
    sourcePane.style.display = 'none';
    editorContainer.style.gridTemplateColumns = '1fr';
    toggleBtn.textContent = '📄 Markdown ソース表示';
  }
});
```

CSS Grid で滑らかにアニメーション：

```css
.editor-split-view {
  display: grid;
  grid-template-columns: 1fr;
  transition: grid-template-columns 0.3s ease;
}
```

### ホバー展開式サイドバー

さらにエディタ領域を広げるため、サイドバーを折りたたみ可能に。

```css
.admin-sidebar {
  width: 60px;
  transition: width 0.3s ease;
  overflow-x: hidden;
}

.admin-sidebar:hover {
  width: 250px;
}
```

**効果**:
- 通常時: 60px（絵文字アイコンのみ）
- ホバー時: 250px（テキスト表示）
- エディタ領域が190px拡大

## 実装フェーズ5: 画像アップロード

### Supabase Storage との統合

```typescript
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'アップロードに失敗しました');
  }

  const data = await response.json();
  return data.url;  // Supabase Storage の公開URL
}
```

サーバーサイド (`/api/upload/image`):

```typescript
app.post('/api/upload/image', authMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const file = body.image as File;

  // ファイル検証
  if (!file || !file.type.startsWith('image/')) {
    return c.json({ error: '画像ファイルのみアップロード可能です' }, 400);
  }

  // Supabase Storage にアップロード
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(`public/${fileName}`, file);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const publicUrl = supabase.storage
    .from('blog-images')
    .getPublicUrl(`public/${fileName}`).data.publicUrl;

  return c.json({ url: publicUrl });
});
```

### 課題4: D&D アップロードが動かない

**問題**: 画像をドラッグしても反応なし。

**原因**: `Crepe.Feature.ImageBlock` を有効化していなかった。

```typescript
// ❌ 画像機能が無効
features: {
  [Crepe.Feature.Toolbar]: true,
  // ImageBlock がない
}
```

**解決策**: `ImageBlock` を追加し、`onUpload` コールバックを実装。

```typescript
// ✅ 画像アップロード有効化
features: {
  [Crepe.Feature.ImageBlock]: {
    onUpload: async (file: File) => {
      const url = await uploadImage(file);
      return url;
    },
  },
}
```

**学び**: Crepe のドキュメントで Feature 一覧を確認すべきだった。

## テスト & デバッグ

### デバッグコードの活用

開発中は、同期動作を可視化するためのコンソールログを挿入：

```typescript
crepe.on((listener) => {
  listener.markdownUpdated(() => {
    console.log('🔄 Sync callback called');
    const markdown = crepe.getMarkdown();
    console.log('✅ Markdown:', markdown);
    onMarkdownChange(markdown);
  });
});
```

本番リリース前に全て削除。

### ブラウザ DevTools

- **Elements**: CSS Grid のレイアウト変更を確認
- **Console**: エラー、同期タイミングを監視
- **Network**: 画像アップロードのリクエスト/レスポンスを確認
- **Application > Storage**: LocalStorage (将来の自動保存機能用)

## 完成！最終的な成果

### 実装した機能

- ✅ Milkdown Crepe WYSIWYGエディタ
- ✅ リアルタイムMarkdownプレビュー
- ✅ トグル式分割ビュー（WYSIWYG ⇄ Markdown）
- ✅ ホバー展開式サイドバー（エディタ領域最大化）
- ✅ 画像ドラッグ&ドロップアップロード
- ✅ Supabase Storage 統合
- ✅ ツールバー（太字、斜体、リスト、コードブロック等）
- ✅ CommonMark + GFM サポート

### パフォーマンス

- **初回ロード**: ~600ms（Vite最適化済み）
- **エディタ初期化**: ~200ms
- **同期レイテンシ**: <10ms（リアルタイム）
- **バンドルサイズ**: 1.4MB (未圧縮), 440KB (gzip)

### ユーザー体験

**Before (Plain Textarea)**:
- 記述 → 保存 → 公開ページで確認 → 修正 → 保存 → 確認...
- サイクルタイム: ~30秒/回

**After (Milkdown Crepe)**:
- リアルタイムプレビュー → 確認しながら執筆
- サイクルタイム: 0秒（即座に確認）

## 学んだこと

### 技術面

1. **ProseMirror エコシステムの強力さ**
   - リッチテキストエディタのデファクトスタンダード
   - Notion, Dropbox Paper, Atlassian 製品も採用

2. **Vite のビルド最適化**
   - コード分割、Tree Shaking が自動
   - 開発体験が良い（HMR、即座のフィードバック）

3. **クライアント・サーバー分離アーキテクチャ**
   - Hono (サーバー) + Vite (クライアント) の組み合わせ
   - それぞれの役割を明確に分離

### プロセス面

1. **ドキュメントをまず読む**
   - 公式ドキュメント、Playground、GitHubのIssue
   - 時間をかけても最初に理解すべき

2. **段階的な実装**
   - 一気に全機能を実装しない
   - 小さく動かして確認 → 拡張 → 確認...

3. **ユーザーフィードバックの重要性**
   - 「エディタ領域が狭い」というフィードバック
   - トグルボタン、ホバー式サイドバーの実装につながった

## 今後の展開

### 近い将来

- [ ] ドラフト自動保存（LocalStorage）
- [ ] プレビューモード強化（モバイル、タブレット）
- [ ] ショートカットキー拡充 (`Ctrl+B`, `Ctrl+I` 等)

### 中長期

- [ ] リアルタイム共同編集（WebSocket + Yjs）
- [ ] AI アシスト（文章校正、タイトル提案）
- [ ] バージョン履歴（差分表示、ロールバック）

## おわりに

シンプルな `<textarea>` から、モダンなWYSIWYGエディタへの進化は、ユーザー体験を劇的に改善しました。Milkdown Crepe を選んだことで、実装コストを抑えつつ、拡張性の高いエディタを構築できました。

この実装過程で直面した課題と解決策が、同じようなエディタ実装を検討している方の参考になれば幸いです。

**技術スタック:**
- Milkdown Crepe 7.18.0
- Hono (Cloudflare Workers)
- Supabase (Storage)
- Vite 7.3.1

**リポジトリ**: (公開予定)

**デモ**: (公開予定)

---

Happy Coding! 🚀

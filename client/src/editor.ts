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

  // エディタの作成
  await crepe.create();

  // Markdown の変更を監視（公式APIを使用）
  crepe.on((listener) => {
    listener.markdownUpdated(() => {
      const markdown = crepe.getMarkdown();
      onMarkdownChange(markdown);
    });
  });

  return crepe;
}

// グローバルに公開（ブラウザから呼び出せるように）
(window as any).initMilkdownEditor = initMilkdownEditor;

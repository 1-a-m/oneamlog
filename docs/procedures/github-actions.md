# GitHub Actions 運用手順書

## 概要

本プロジェクトではGitHub Actionsを使ってセキュリティチェックを自動実行している。
デプロイはCloudflare + GitHub連携が担当するため、GitHub Actionsではデプロイは行わない。

## ワークフロー一覧

| ワークフロー | ファイル | 目的 |
|------------|--------|------|
| Security Audit | `.github/workflows/security.yml` | npm依存パッケージの脆弱性チェック |

## Security Audit ワークフロー

### 実行タイミング

| トリガー | 条件 |
|---------|------|
| push | `main`ブランチへのpush時 |
| pull_request | `main`ブランチへのPR作成/更新時 |
| schedule | 毎週月曜日 0:00 UTC（日本時間 月曜 9:00） |

### 処理内容

```yaml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4        # リポジトリをチェックアウト
      - uses: actions/setup-node@v4      # Node.js 20をセットアップ
        with:
          node-version: '20'
      - run: npm ci                      # 依存パッケージをインストール
      - run: npm audit --audit-level=high  # highレベル以上の脆弱性をチェック
```

### 結果の確認方法

1. GitHubリポジトリの **Actions** タブを開く
2. 左メニューから **Security Audit** を選択
3. 各実行の詳細をクリックして結果を確認

### ステータス

| 状態 | 意味 |
|-----|------|
| 緑（Success） | 高リスク以上の脆弱性なし |
| 赤（Failure） | high以上の脆弱性が検出された。対応が必要 |

### 失敗時の対応手順

1. **Actionsタブで詳細を確認**
   - どのパッケージに脆弱性があるか確認する

2. **ローカルで詳細を確認**
   ```bash
   npm audit
   ```

3. **自動修正を試みる**
   ```bash
   npm audit fix
   ```

4. **自動修正できない場合**
   ```bash
   # 破壊的変更を含む修正（メジャーバージョンアップ等）
   npm audit fix --force
   ```
   ※ `--force`はメジャーバージョンアップを含むため、動作確認が必要

5. **パッケージ自体に問題がある場合**
   - 代替パッケージへの移行を検討
   - GitHub Advisoryで修正予定を確認

6. **修正後**
   ```bash
   npm audit              # 脆弱性が解消されたか確認
   npm run dev            # ローカルで動作確認
   git add package.json package-lock.json
   git commit -m "fix: npm auditの脆弱性を修正"
   git push
   ```

## Dependabot

### 設定ファイル
`.github/dependabot.yml`

### 動作
- 毎週npmパッケージの更新をチェック
- 更新があるパッケージごとにPull Requestを自動作成（最大5件/週）

### Dependabot PRの対応手順

1. **GitHubのPull Requestsタブ**でDependabotのPRを確認
2. PRの内容（変更されるパッケージ・バージョン）を確認
3. **Security Audit CIが通っているか**確認（PRに対して自動実行される）
4. 問題なければ **Merge** する
5. 問題がある場合：
   - ローカルでブランチをチェックアウトして動作確認
   - 必要に応じてPRをクローズ

```bash
# DependabotのPRをローカルで確認する場合
gh pr checkout <PR番号>
npm run dev
# 動作確認後
gh pr merge <PR番号>
```

## 手動実行

GitHub Actionsのワークフローを手動で実行したい場合：

1. GitHubリポジトリの **Actions** タブを開く
2. 左メニューから **Security Audit** を選択
3. **Run workflow** ボタンをクリック
4. ブランチを選択して **Run workflow** を実行

※ 手動実行を有効にするには、`security.yml`に`workflow_dispatch`トリガーを追加する必要がある：
```yaml
on:
  workflow_dispatch:  # この行を追加
  push:
    branches: [main]
  # ...
```

## ローカルでの確認コマンド

```bash
# 脆弱性チェック
npm audit

# 詳細レポート
npm audit --json

# 自動修正
npm audit fix

# GitHub ActionsのCI結果確認（gh CLI）
gh run list --workflow=security.yml
gh run view <run-id>
```

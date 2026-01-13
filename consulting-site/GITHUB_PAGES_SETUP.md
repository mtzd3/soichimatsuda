# GitHub Pages デプロイ設定ガイド

このドキュメントでは、松田聡一のコンサルティングサイトをGitHub Pagesで公開するための手順を説明します。

## 前提条件

- GitHubアカウント
- ローカルマシンにGitがインストール済み
- Node.js 18+とpnpmがインストール済み

## ステップ1: GitHubリポジトリの作成

1. GitHub（https://github.com）にログイン
2. 新しいリポジトリを作成
   - リポジトリ名：`soichi-matsuda` または `consulting-site`
   - 説明：`Soichi Matsuda - AI & Deep Learning Technical & Business Advisor`
   - 公開設定：Public
   - README、.gitignore、Licenseは不要（後で追加）

## ステップ2: ローカルリポジトリの初期化

```bash
cd /home/ubuntu/consulting-site
git init
git add .
git commit -m "Initial commit: Tech Minimalism design with SEO optimization"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/soichi-matsuda.git
git push -u origin main
```

## ステップ3: GitHub Pages設定

1. GitHubリポジトリページで「Settings」をクリック
2. 左メニューから「Pages」を選択
3. 「Source」で以下を設定：
   - Branch: `main`
   - Folder: `/` (root)
4. 「Save」をクリック

## ステップ4: ビルドとデプロイ

### 方法A: GitHub Actions（推奨）

`.github/workflows/deploy.yml`を作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 方法B: 手動デプロイ

```bash
# ビルド
pnpm build

# distディレクトリをコミット
git add dist/
git commit -m "Build for deployment"
git push origin main
```

## ステップ5: カスタムドメイン設定（オプション）

独自ドメイン（例：soichi-matsuda.com）を使用する場合：

1. ドメインレジストラ（GoDaddy、Namecheap等）でDNS設定を変更
2. GitHubリポジトリの「Settings」→「Pages」で「Custom domain」に入力
3. DNSレコード設定：
   - A レコード：
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - CNAME レコード（www用）：
     - `YOUR_USERNAME.github.io`

## ステップ6: SEO設定確認

デプロイ後、以下を確認：

1. **メタタグ確認**
   ```bash
   curl -I https://soichi-matsuda.github.io
   ```

2. **robots.txt確認**
   ```
   https://soichi-matsuda.github.io/robots.txt
   ```

3. **sitemap.xml確認**
   ```
   https://soichi-matsuda.github.io/sitemap.xml
   ```

4. **構造化データ確認**
   - Google Rich Results Test: https://search.google.com/test/rich-results
   - Schema.org Validator: https://validator.schema.org/

## ステップ7: 検索エンジン登録

### Google Search Console
1. https://search.google.com/search-console にアクセス
2. 「プロパティを追加」をクリック
3. URLプレフィックスで `https://soichi-matsuda.github.io` を入力
4. HTMLファイルをアップロードして確認
5. sitemap.xmlを送信

### Bing Webmaster Tools
1. https://www.bing.com/webmasters にアクセス
2. サイトを追加
3. sitemap.xmlを送信

## ステップ8: AI検索対応

以下のAI検索エンジンに対応：

- **Google SGE（Search Generative Experience）**
  - 構造化データ（Schema.org）対応済み
  - メタデータ最適化済み

- **Perplexity AI**
  - robots.txtで許可済み
  - 自然な日本語コンテンツ

- **OpenAI ChatGPT**
  - robots.txtで許可済み

## トラブルシューティング

### サイトが表示されない場合

1. リポジトリが公開設定か確認
2. GitHub Pagesが有効化されているか確認
3. ブランチが正しいか確認（main）
4. 5～10分待機（デプロイに時間がかかる場合がある）

### SEOが反映されない場合

1. Google Search Consoleでインデックス登録をリクエスト
2. 24～48時間待機
3. キャッシュをクリアして再確認

### ビルドエラーが発生した場合

```bash
# キャッシュをクリア
rm -rf node_modules pnpm-lock.yaml
pnpm install

# ビルド再実行
pnpm build
```

## 継続的な更新

コンテンツを更新する場合：

```bash
# 変更をコミット
git add .
git commit -m "Update content: [説明]"
git push origin main

# GitHub Actionsが自動的にビルド・デプロイ
```

## 参考リンク

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Static Site Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Documentation](https://schema.org/)

## サイト情報

- **プロジェクト名**: consulting-site
- **デザイン**: Tech Minimalism
- **SEO対応**: ✓ 構造化データ、メタタグ、robots.txt、sitemap.xml
- **AI検索対応**: ✓ 自然な日本語、明確な情報構造
- **モバイル対応**: ✓ レスポンシブデザイン
- **パフォーマンス**: ✓ 静的サイト（高速読み込み）

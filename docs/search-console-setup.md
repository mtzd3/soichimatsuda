# Search Console Setup

`キーワード流入`、`表示回数`、`クリック数`、`CTR`、`平均掲載順位` を見たい場合は、site analytics に加えて `Google Search Console` を使います。

このサイトでは、`Google Analytics` や `Plausible` は「サイト内で何が起きたか」を見るためのものです。検索キーワード流入の一次情報は `Google Search Console` で確認します。

## このサイトでのおすすめ設定

現在の公開URLは以下です。

- `https://mtzd3.github.io/soichimatsuda/`
- `https://mtzd3.github.io/soichimatsuda/ai-advisor.html`
- `https://mtzd3.github.io/soichimatsuda/deeptech-strategy.html`
- `https://mtzd3.github.io/soichimatsuda/poc-to-production.html`

この構成では、まず `URL-prefix property` として登録するのが実務上いちばん扱いやすいです。

## やること

1. `Google Search Console` で `https://mtzd3.github.io/soichimatsuda/` を URL-prefix property として追加する
2. 所有権確認で `HTML tag` を選ぶ
3. 発行された `<meta name="google-site-verification" ...>` を [index.html](/Users/so01/codex/Github-pages/index.html:11) 付近の head に追加する
4. 公開後、`sitemap.xml` を Search Console に送信する

## このリポジトリで追加済みのもの

- [robots.txt](/Users/so01/codex/Github-pages/robots.txt:1)
- [sitemap.xml](/Users/so01/codex/Github-pages/sitemap.xml:1)

## 見られるようになる指標

- 検索クエリ別のクリック数
- 検索クエリ別の表示回数
- CTR
- 平均掲載順位
- ランディングページごとの検索流入

## このサイトで特に見たいクエリ例

- `松田総一`
- `LeapMind`
- `エッジAI`
- `組込みAI`
- `Soichi Matsuda`
- `AI顧問`
- `AI アドバイザリー`
- `ディープテック 事業戦略`
- `AI PoC 本番導入`
- `ロボティクス 事業戦略`
- `宇宙 スタートアップ 事業戦略`
- `自動運転 事業開発`
- `製造 AI 導入`

## 補足

- Search Console のデータは Google 検索由来の流入が中心です
- サイト内での問い合わせ導線や FAQ 開封などの行動は `analytics` 側で見るのが適しています
- `キーワードで流入して、その後メールやSNSへ進んだか` をざっくり見たい場合は、Search Console と GA4 を併用するのが扱いやすいです
- GA4 を使う場合は、Search Console とプロパティ連携しておくと分析しやすくなります

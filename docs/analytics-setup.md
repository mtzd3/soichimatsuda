# Analytics Setup

このサイトには、静的HTMLのまま使える軽量な analytics 基盤を入れています。`/Users/so01/codex/Github-pages/index.html` の `window.SITE_ANALYTICS` を設定すると有効になります。

現状は `GA4` を使う前提で初期値を入れています。

## 対応プロバイダ

- `ga4`
- `plausible`

## 有効化方法

`index.html` の head にある以下を編集します。

```html
<script>
    window.SITE_ANALYTICS = window.SITE_ANALYTICS || {
        provider: "ga4",
        gaMeasurementId: "",
        plausibleDomain: "",
        debug: false
    };
</script>
```

このサイトでは `provider: "ga4"` をそのまま使い、`gaMeasurementId` に発行済みの `G-XXXXXXXXXX` を入れるだけで有効化できます。

### GA4 を使う場合

```html
<script>
    window.SITE_ANALYTICS = {
        provider: "ga4",
        gaMeasurementId: "G-XXXXXXXXXX",
        plausibleDomain: "",
        debug: false
    };
</script>
```

## GA4 で見るもの

- `Realtime`
- `Events`
- `Traffic acquisition`
- `Landing page`

問い合わせ導線や FAQ 開封などのサイト内行動は GA4 側で確認します。

### Plausible を使う場合

```html
<script>
    window.SITE_ANALYTICS = {
        provider: "plausible",
        gaMeasurementId: "",
        plausibleDomain: "mtzd3.github.io",
        debug: false
    };
</script>
```

独自ドメインを使う場合は、`plausibleDomain` をそのドメインに合わせて変更します。

## 自動計測するイベント

- `nav_click`
- `cta_click`
- `contact_click`
- `social_click`
- `faq_open`

## 主な計測ポイント

- ヘッダーナビゲーション
- 相談導線のメールCTA
- 実績への導線
- ソーシャルリンク
- FAQの開封

## 確認方法

1. サイトを開く
2. ナビやメールCTAをクリックする
3. FAQを開く
4. GA4 の `Realtime` と `Events` で反映を確認する

## 運用メモ

- `debug: true` にするとブラウザの console に送信イベントを表示できます
- analytics を無効のままにしたい場合は、`provider` を空文字のままにします
- GitHub Pages でそのまま動くように、ビルドや追加ライブラリには依存していません
- 検索クエリやキーワード流入は analytics ではなく [search-console-setup.md](/Users/so01/codex/Github-pages/docs/search-console-setup.md:1) 側で管理します
- GA4 を本番で有効化するには `G-` で始まる Measurement ID が必要です

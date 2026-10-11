# 計測設定

現行は1ページ、フォームなし。GA4は `index.html` の `window.SITE_ANALYTICS` で設定する。Measurement ID: `G-D11DRB2ZPF`。

`nav_click`、`cta_click`、`contact_click`（メール作成）、`contact_copy`（アドレスコピー成功）、`faq_open` を計測する。

メール作成を問い合わせ獲得と扱わない。`generate_lead` / `qualify_lead` は自動送信しない。実際の問い合わせ件数はGmail着信で確認する。訪問者の氏名・返信先・メール本文は収集しない。

UTMと最初の流入ページのパスはセッション内で保持する。独自イベントの `landing_page` に任意のクエリ文字列やフラグメントは含めない。ストレージが利用できない・保存値が不正・計測関数が例外を返す場合も、本文・メール作成・コピーは使える。

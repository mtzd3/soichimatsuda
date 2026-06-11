# 問い合わせフォームの Slack 通知

このサイトの問い合わせフォームは FormSubmit でメール通知を送っています。Slack 通知は、FormSubmit の `_webhook` から Cloudflare Worker を呼び、Worker が Slack Incoming Webhook に整形して投稿する構成にします。

Slack の Incoming Webhook URL は秘密情報なので、`index.html` には入れません。公開 HTML に入るのは Worker の URL だけです。

## 構成

1. ユーザーが問い合わせフォームを送信
2. FormSubmit がメール通知を送信
3. FormSubmit が `_webhook` の URL にフォーム内容を POST
4. Cloudflare Worker が Slack 用の JSON に整形
5. Slack Incoming Webhook が指定チャンネルへ投稿

## セットアップ

1. Slack で通知先チャンネル用の Incoming Webhook URL を発行する
2. Cloudflare Worker をデプロイする

```bash
cd integrations/slack
cp wrangler.toml.example wrangler.toml
npx wrangler@latest secret put SLACK_WEBHOOK_URL
npx wrangler@latest deploy
```

3. デプロイ後に発行される Worker URL を GitHub Actions の Repository variable に入れる

```text
CONTACT_SLACK_WEBHOOK_URL=https://matsuda-contact-slack.<your-subdomain>.workers.dev/
```

4. `main` に push して GitHub Pages を再デプロイする

GitHub Actions の build で `CONTACT_SLACK_WEBHOOK_URL` が設定されている場合だけ、公開用の `index.html` に FormSubmit の `_webhook` hidden field が注入されます。

## 動作確認

Worker 単体の確認:

```bash
curl -X POST "$CONTACT_SLACK_WEBHOOK_URL" \
  -H "content-type: application/json" \
  --data '{
    "form_data": {
      "source": "matsuda_prof",
      "name": "山田 太郎",
      "company": "株式会社サンプル",
      "email": "yamada@example.com",
      "topic": "AI・半導体プロジェクト支援について",
      "message": "テスト送信です。",
      "page_url": "https://mtzd3.github.io/soichimatsuda/"
    }
  }'
```

フォーム経由の確認:

1. 公開サイトのフォームからテスト送信する
2. メール通知が届くことを確認する
3. Slack の指定チャンネルに「新規お問い合わせ」が投稿されることを確認する

FormSubmit は初回利用時にメール確認が必要になる場合があります。Slack に届かない場合は、FormSubmit のメール確認、GitHub Actions の `CONTACT_SLACK_WEBHOOK_URL`、Worker の `SLACK_WEBHOOK_URL` secret、Cloudflare Worker のログを順に確認します。

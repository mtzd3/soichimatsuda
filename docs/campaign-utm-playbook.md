# Campaign UTM Playbook

GA4 では Direct 流入が多く、どの投稿やプロフィールから来たかが見えにくい状態でした。今後は外部リンクに UTM を付けて、少ない流入でも質を判断できるようにします。

## 基本ルール

- `utm_source`: 媒体名。例: `x`, `linkedin`, `note`, `facebook`
- `utm_medium`: 種別。例: `social`, `profile`, `article`, `referral`
- `utm_campaign`: 施策名。例: `ai_advisory_202604`, `deeptech_strategy_202604`
- `utm_content`: 投稿や設置場所。例: `profile`, `post_01`, `footer_link`

## 使うURL

### AI顧問

```text
https://mtzd3.github.io/soichimatsuda/ai-advisor.html?utm_source=x&utm_medium=social&utm_campaign=ai_advisory_202604&utm_content=post_01
```

```text
https://mtzd3.github.io/soichimatsuda/ai-advisor.html?utm_source=linkedin&utm_medium=social&utm_campaign=ai_advisory_202604&utm_content=post_01
```

### ディープテック事業戦略

```text
https://mtzd3.github.io/soichimatsuda/deeptech-strategy.html?utm_source=x&utm_medium=social&utm_campaign=deeptech_strategy_202604&utm_content=post_01
```

```text
https://mtzd3.github.io/soichimatsuda/deeptech-strategy.html?utm_source=linkedin&utm_medium=social&utm_campaign=deeptech_strategy_202604&utm_content=post_01
```

### PoCから本番導入

```text
https://mtzd3.github.io/soichimatsuda/poc-to-production.html?utm_source=x&utm_medium=social&utm_campaign=poc_to_production_202604&utm_content=post_01
```

```text
https://mtzd3.github.io/soichimatsuda/poc-to-production.html?utm_source=linkedin&utm_medium=social&utm_campaign=poc_to_production_202604&utm_content=post_01
```

## 投稿テーマ

- AI顧問は、ツール導入相談ではなく「経営判断を前に進める役割」として発信する
- ディープテック事業戦略は、技術優位、顧客課題、資本政策、提携の接続を強調する
- PoCから本番導入は、PoC成功後に止まる理由と、経営判断に必要な条件を扱う

## 高単価に寄せる見せ方

- 価格や時間単価ではなく、判断の重さ、関係者、成果物、期間を説明する
- 「まず相談」より「何を判断したいかを共有してください」と書く
- 低単価のスポット相談を前面に出さず、継続アドバイザリー、短期戦略プロジェクト、資本・提携判断を入口にする
- 投稿本文から直接問い合わせへ飛ばすより、テーマページを経由して文脈を作る

## 週次レビュー

- `utm_campaign` ごとの `form_start`
- `utm_campaign` ごとの `qualify_lead`
- `lead_interest` の内訳
- `contact_topic` の内訳
- 問い合わせ本文に意思決定者、期限、期待成果が含まれているか

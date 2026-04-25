# GA4 Post Release Checklist

サイト公開後に、問い合わせ改善の効果を判断するための確認項目です。目的は「アクセス数」だけでなく、少ない流入から高単価の相談につながる兆しを見つけることです。

## 必ず設定するもの

1. GA4 の `Admin` から `Key events` を開く
2. `qualify_lead` がキーイベントになっていることを確認する
3. `form_submit` は送信試行なので、キーイベントにはしない
4. `lead_interest`、`contact_topic`、`landing_page` をイベントスコープのカスタムディメンションに追加する

## 公開直後の動作確認

1. `https://mtzd3.github.io/soichimatsuda/?utm_source=test&utm_medium=qa&utm_campaign=release_check&interest=ai-advisor#contact-form` を開く
2. フォームに入力を始める
3. GA4 の `Realtime` または `DebugView` で `form_start` が出ることを確認する
4. 送信ボタンを押したら `form_submit` が出ることを確認する
5. `?submitted=1` で戻ったら `generate_lead` と `qualify_lead` が出ることを確認する

## 週次で見るレポート

- `Landing page`: どのページが入口になっているか
- `Traffic acquisition`: Direct 以外の流入が増えているか
- `Events`: `cta_click`、`form_start`、`form_submit`、`generate_lead` / `qualify_lead` の落差
- `lead_interest`: どの相談テーマがフォーム入力まで進んだか
- `contact_topic`: フォームで最終的に選ばれた相談内容
- `utm_campaign`: 投稿やプロフィールリンクごとの質

## 判断基準

- `page_view` は増えているが `form_start` が少ない場合: CTA の位置やコピーを改善する
- `form_start` はあるが `form_submit` が少ない場合: フォームの必須項目や心理的ハードルを見直す
- `form_submit` はあるが `qualify_lead` が少ない場合: FormSubmit の戻り先や迷惑メール判定を確認する
- `qualify_lead` は少なくても `lead_interest` が高単価テーマに寄る場合: 価格表を戻さず、関与範囲の説明を強める

## 価格表を外した後に見ること

公開価格を外すと、低単価の比較検討流入は減る可能性があります。一方で、問い合わせの文脈が「いくらですか」から「何を判断したいか」に変われば成功です。

見るべき指標は問い合わせ数だけではありません。問い合わせ本文に、意思決定者、期限、期待成果、関係者、予算感のいずれかが含まれるかを確認します。

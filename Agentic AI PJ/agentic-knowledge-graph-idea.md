# Agentic Knowledge Graph 構想メモ

作成日: 2026-05-03

## 目的

Graphify v5 の設計から、顧客が AI を使えば使うほどナレッジグラフと業務データベースが自動生成され、AI の回答品質も継続的に改善される仕組みに取り込める要素を整理する。

## 中心仮説

顧客の AI 利用ログ、アップロード資料、会話、議事録、CRM 更新、業務イベントを継続的に解析し、エンティティと関係性をナレッジグラフとして蓄積する。

その結果、AI は毎回ゼロから文脈を読むのではなく、成長し続ける構造化メモリを参照できる。顧客が AI を使うほど、次の 2 つが同時に進む。

1. 顧客固有の DB / Knowledge Graph が自動生成される
2. フィードバックにより検索、抽出、回答、提案の精度が改善される

ただし、ここで言う改善は厳密な RLHF というより、まずは以下として捉える方が現実的。

- Knowledge Graph feedback loop
- Retrieval / reranking の改善
- 抽出ポリシーの改善
- 顧客別 preference model の更新
- 信頼度スコアの継続的な補正

## Graphify から取り込める要素

### 1. 永続グラフを AI のメモリレイヤーにする

Graphify はコード、文書、PDF、画像、音声、動画などをノードとエッジに変換し、`graph.json` として永続化する。

この考え方を顧客 AI に適用すると、以下がすべてグラフの材料になる。

- チャット履歴
- 商談メモ
- 問い合わせ
- 議事録
- アップロード資料
- CRM / SFA 更新
- Slack / メール
- 社内ドキュメント
- チケット
- ツール実行結果

重要なのは、これらを単なる検索対象ではなく、構造化された業務メモリとして扱うこと。

### 2. EXTRACTED / INFERRED / AMBIGUOUS の信頼度設計

Graphify は関係性を次のように分類する。

- `EXTRACTED`: ソースに明示されている事実
- `INFERRED`: 妥当だがモデルが推論した関係
- `AMBIGUOUS`: 不確実でレビューが必要な関係

顧客データで最も危険なのは、AI の推測が事実として DB に保存されること。

そのため、自動生成 DB では以下を必須にする。

- すべてのエッジに confidence を付ける
- すべてのエッジに source event / source span を付ける
- `INFERRED` は高信頼でも事実とは扱わない
- `AMBIGUOUS` はレビューキューに送る
- 顧客の承認、修正、却下で confidence を更新する

### 3. Agentic extraction は候補生成に留める

エージェントは勝手にノードとエッジ候補を作る。ただし、直接本番 DB に入れるのではなく、まず staging graph に保存する。

推奨フロー:

```text
顧客イベント
  -> Extraction Agents
  -> Staging Knowledge Graph
  -> confidence / provenance / privacy check
  -> Committed Knowledge Graph
```

自動昇格の基準例:

- ソースに明示されている `EXTRACTED`
- 同じ事実が複数ソースで確認されている
- 既存グラフと矛盾しない
- PII / 権限 / テナント分離チェックを通過
- 顧客が過去に同種の抽出を承認している

レビュー対象の例:

- 重要な意思決定に関する `INFERRED`
- 顧客属性、契約条件、金額、医療、法務など高リスク情報
- 既存グラフと矛盾する関係
- 低 confidence の人物・組織・責任範囲

### 4. Q&A 結果をグラフに戻す

Graphify には Q&A 結果を markdown として保存し、次回更新でグラフに取り込む feedback loop がある。

顧客 AI では、以下をすべてイベントとして保存する。

- ユーザーの質問
- AI の回答
- 回答時に参照したノード
- 回答に使われたドキュメント
- ユーザーの修正
- 採用 / 却下
- 再質問
- ツール実行結果
- 業務上の最終 outcome

このログにより、「顧客が AI を使うほど KG が育つ」状態を作れる。

### 5. ベクトル DB だけでなく関係性を一級市民にする

Graphify は意味的な近さも `semantically_similar_to` のようなエッジとして扱う。

顧客 AI でも、単なる embedding 検索ではなく、関係性を保存することが重要。

例:

- この問い合わせは過去の障害と似ている
- この商談の論点は別部署の要望とつながっている
- この顧客の懸念は過去の解約理由と近い
- この意思決定は特定人物の preference と関係している
- このタスクは別プロジェクトの blocker と依存している

検索対象ではなく、推論対象として DB が育つ。

### 6. Community detection を UX に使う

Graphify は graph topology からコミュニティを検出し、god nodes、surprising connections、suggested questions を出す。

顧客 AI での応用例:

- 顧客ごとの主要課題を自動抽出する
- チーム内の隠れた依存関係を見つける
- 部署横断でつながっているテーマを検出する
- よく使われる知識と使われない知識を分ける
- 未解決論点や曖昧な関係をレビュー対象にする

これにより、ナレッジグラフが裏側の DB だけでなく、管理画面やインサイト UI の価値になる。

### 7. Hyperedge で業務フローを表現する

通常の A -> B のペア関係だけでは、業務上の集合的な関係を表現しづらい。

Hyperedge を使うと、次のような 3 者以上のまとまりを表現できる。

- 商談 = 顧客、担当者、課題、競合、予算、決裁者、次アクション
- 障害 = 原因、影響範囲、担当チーム、暫定対応、恒久対応
- 契約 = 条項、リスク、交渉相手、承認者、期限
- 研究テーマ = 論文、仮説、実験、結果、未検証論点

CRM、法務、医療、コンサル、研究領域では特に有効。

### 8. AI が回答前に必ず KG を見る仕組み

Graphify は hooks / rules / MCP により、AI アシスタントがファイル検索の前にグラフを参照する仕組みを持つ。

顧客 AI でも、回答前に tenant KG を参照することを標準動作にする。

```text
User prompt
  -> intent detection
  -> graph query / subgraph retrieval
  -> evidence ranking
  -> answer generation
  -> feedback capture
```

これにより、ナレッジグラフが単なる後処理データではなく、AI 推論の入口になる。

## 提案アーキテクチャ

```text
顧客の AI 利用 / 資料 / 業務イベント
  -> Event Log
  -> Extraction Agents
  -> Staging Knowledge Graph
  -> confidence / provenance / privacy check
  -> Committed Graph DB
  -> Agent Query API / MCP
  -> 回答・提案・業務アクション
  -> user feedback / implicit outcome
  -> graph confidence 更新 + retrieval / extraction policy 改善
```

## データモデル案

### Node types

- `Customer`
- `Person`
- `Company`
- `Project`
- `Issue`
- `Requirement`
- `Decision`
- `Preference`
- `Document`
- `Conversation`
- `Action`
- `Outcome`
- `Concept`
- `Product`
- `Contract`
- `Ticket`
- `Meeting`

### Edge types

- `asked_about`
- `mentions`
- `owns`
- `blocked_by`
- `depends_on`
- `decided`
- `prefers`
- `rejected`
- `approved`
- `caused_by`
- `evidence_for`
- `contradicts`
- `similar_to`
- `follow_up_for`
- `belongs_to`
- `requested_by`
- `resolved_by`

### Required metadata

- `tenant_id`
- `source_event_id`
- `source_file`
- `source_span`
- `confidence`
- `confidence_score`
- `feedback_state`
- `created_at`
- `updated_at`
- `valid_from`
- `valid_to`
- `privacy_scope`
- `model_version`
- `extractor_version`

## フィードバックループ設計

### 明示フィードバック

- thumbs up / down
- 回答の直接修正
- ノード / エッジの承認
- ノード / エッジの却下
- 「これは古い」「これは正しい」「これは別人」などの訂正
- 管理画面でのレビュー

### 暗黙フィードバック

- 生成文の編集量
- 同じ質問の再実行
- 再質問の有無
- 回答後に実行されたアクション
- チケット解決
- 商談進捗
- ドキュメント保存
- 提案の採用率
- ツール実行の成功 / 失敗

### 改善対象

基盤モデルそのものをすぐ fine-tune / RLHF するのではなく、まず以下を改善する。

- graph retrieval
- subgraph ranking
- answer reranking
- extraction prompts
- relation type classifier
- confidence calibration
- tenant-specific preference model
- ambiguity detection

## MVP

### Phase 1: イベントログと抽出

- チャットログを保存
- アップロード資料を保存
- 会話から entity / relation を抽出
- `EXTRACTED / INFERRED / AMBIGUOUS` を必須化
- source citation を保存

### Phase 2: Staging KG

- 抽出結果を staging graph に保存
- confidence に応じて自動昇格 / レビューに分岐
- 既存グラフとの重複・矛盾を検出
- 顧客別に tenant graph を分離

### Phase 3: 回答時の KG 参照

- ユーザー質問から関連サブグラフを取得
- 回答に参照ノードと根拠を付ける
- 回答後のフィードバックを保存
- Q&A 結果を再抽出対象として memory に戻す

### Phase 4: インサイト UI

- God nodes: 顧客・組織・案件ごとの中心概念
- Surprising connections: 隠れた関係
- Ambiguous edges: 要レビュー項目
- Suggested questions: AI が次に聞くべき問い
- Knowledge gaps: 足りない情報

## 主要リスクと対策

### リスク 1: 推測が事実として保存される

対策:

- confidence label を必須化
- source span を必須化
- `INFERRED` と `AMBIGUOUS` は UI 上も区別
- 重要情報は human approval を必須化

### リスク 2: 古い情報が残り続ける

対策:

- `valid_from` / `valid_to` を持たせる
- 新しい情報と矛盾したら contradiction edge を作る
- 古いノードを削除せず deprecate する
- temporal graph として扱う

### リスク 3: 顧客間データ混入

対策:

- `tenant_id` を全ノード・エッジに必須化
- tenant boundary を query layer で強制
- extraction agent も tenant-scoped にする
- cross-tenant 学習は匿名化された aggregate signal のみに限定

### リスク 4: グラフがノイズで膨張する

対策:

- staging graph を挟む
- low-confidence edge を自動昇格しない
- 類似ノードの merge policy を持つ
- 使用されないノードを low-priority にする
- 定期的に community / isolated node をレビュー

### リスク 5: RLHF と呼ぶには弱い

対策:

- 初期表現は RLHF ではなく feedback loop / preference learning とする
- 実際に報酬モデルや preference dataset を作る段階で RLHF と呼ぶ
- まずは retrieval / reranking / confidence calibration の改善に集中する

## 初期プロダクト仮説

「顧客が AI を使うほど、AI がその顧客の業務・好み・論点・関係者・過去判断を構造化して覚え、次回以降の回答や提案が賢くなる」

これを実現するための核は、チャット履歴を保存することではなく、利用のたびに業務知識をノードとエッジに変換し、信頼度と根拠付きで育てること。

## 競争優位になりそうなポイント

- 顧客ごとに育つ private knowledge graph
- 回答だけでなく DB も自動生成される
- 曖昧さを可視化できるため、業務利用しやすい
- AI 利用ログがそのまま次の AI 性能改善に使える
- ベクトル検索よりも説明可能性が高い
- 管理画面で knowledge gaps / ambiguous edges を見せられる
- 顧客固有の業務 memory が lock-in になる

## 参照

- [Graphify v5 README](https://github.com/safishamsi/graphify/tree/v5)
- [Graphify ARCHITECTURE.md](https://github.com/safishamsi/graphify/blob/v5/ARCHITECTURE.md)
- [Graphify ingest.py](https://github.com/safishamsi/graphify/blob/v5/graphify/ingest.py)
- [Graphify serve.py](https://github.com/safishamsi/graphify/blob/v5/graphify/serve.py)

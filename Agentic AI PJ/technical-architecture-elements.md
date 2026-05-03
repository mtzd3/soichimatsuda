# 技術要素とシステム構成

作成日: 2026-05-03

## 1. 目的

この文書は、業務知識グラフ型 AI オペレーション基盤、および金融機関向け転用システムに共通する技術要素を整理する。

焦点は以下である。

- どのコンポーネントが必要か
- どのデータをどう流すか
- AI と決定論的システムをどう分担するか
- 監査、権限、承認、評価をどう組み込むか
- 金融機関向けに追加すべき制御は何か

## 2. 全体アーキテクチャ

```text
Channels
  -> API Gateway
  -> Identity / Access Control
  -> Event Log
  -> Ingestion Pipeline
  -> Extraction Agents
  -> Staging Graph
  -> Validation Layer
  -> Committed Graph
  -> Retrieval / Query API
  -> Agent Runtime
  -> Workflow Engine
  -> Tool Execution Layer
  -> External Systems
  -> Outcome Capture
  -> Evaluation / Feedback Loop
  -> Observability / Audit
```

金融機関向けでは、以下が追加される。

```text
Core Banking Adapter
Token Ledger
FX / Hedge Engine
Compliance Engine
Sanctions Screening
Transaction Monitoring
Reconciliation Engine
Accounting / GL Adapter
Key Management / HSM
Settlement Control
```

## 3. コンポーネント一覧

### 3.1 Channels

ユーザーや外部システムとの接点。

例:

- Web app
- Chat UI
- Mobile app
- Email
- Voice
- Slack / Teams
- API
- Batch upload
- System webhook

要件:

- ユーザー認証
- テナント識別
- セッション管理
- 入力ログ保存
- 添付ファイル処理
- レート制限

### 3.2 API Gateway

すべてのリクエストの入口。

役割:

- 認証
- 認可
- レート制限
- リクエスト検証
- テナント境界の強制
- 監査ログ生成
- idempotency key 管理

金融機関向けでは、送金、為替、mint / burn などに idempotency が必須である。

### 3.3 Identity / Access Control

ユーザー、サービス、エージェント、ツールの権限を管理する。

必要な概念:

- User
- Role
- Group
- Tenant
- Service Account
- Agent Identity
- Tool Permission
- Approval Authority
- Data Scope
- Transaction Limit

金融機関向け追加:

- 職務分掌
- 金額別承認
- 取引種類別承認
- 署名権限
- 管理者操作の二重承認
- privileged access management

### 3.4 Event Log

すべての入力、出力、ツール実行、承認、結果を保存する不変ログ。

保存対象:

- user_message
- assistant_response
- uploaded_file
- system_event
- tool_call
- tool_result
- approval_request
- approval_decision
- extraction_result
- graph_commit
- policy_check
- outcome
- feedback

要件:

- 追記専用
- 改ざん検知
- タイムスタンプ
- actor
- tenant_id
- correlation_id
- retention policy
- export

金融機関向けでは、取引証跡と監査証跡の基礎になるため、イベントログは中核である。

### 3.5 Ingestion Pipeline

非構造データと構造化データを取り込む。

入力:

- 文書
- PDF
- Office ファイル
- 音声文字起こし
- チャット履歴
- メール
- CRM
- チケット
- 契約
- 請求書
- DWH
- API イベント

処理:

- ファイル解析
- テキスト抽出
- OCR
- 文字起こし
- メタデータ付与
- PII 検出
- chunking
- embedding
- schema mapping
- source span 保存

### 3.6 Extraction Agents

イベントや文書から、ノード、エッジ、属性、業務イベントを抽出する。

抽出結果には必ず以下を持たせる。

- node / edge type
- source_event_id
- source_system
- source_span
- confidence label
- confidence score
- extractor_version
- model_version
- tenant_id

信頼度ラベル:

- `EXTRACTED`: ソースに明示
- `INFERRED`: 推論
- `AMBIGUOUS`: 要確認

抽出 agent は候補を作るだけであり、直接本番グラフには書き込まない。

### 3.7 Staging Graph

抽出結果を一時的に保存する領域。

役割:

- 重複検出
- 矛盾検出
- 既存ノードとの照合
- confidence 判定
- PII / privacy check
- 権限チェック
- レビューキュー生成

自動昇格条件:

- `EXTRACTED`
- source span がある
- 既存情報と矛盾しない
- privacy scope を満たす
- 顧客または運用ルール上、自動承認可能

レビュー対象:

- `INFERRED`
- `AMBIGUOUS`
- 高リスク情報
- 金額、契約、医療、金融、法務情報
- 既存情報との矛盾
- 新規の重要人物や権限者

### 3.8 Validation Layer

Staging Graph から Committed Graph へ移す前に検証する。

検証項目:

- schema validation
- tenant boundary
- source citation
- confidence threshold
- policy rule
- privacy rule
- retention rule
- conflict detection
- approval state
- risk classification

金融機関向け追加:

- KYC status
- AML status
- sanctions result
- transaction limit
- account status
- beneficial owner check
- product suitability
- market rule
- accounting rule

### 3.9 Committed Graph

承認済み、または自動昇格済みの業務知識グラフ。

特徴:

- tenant-scoped
- temporal
- provenance-aware
- confidence-aware
- queryable
- auditable

保存するもの:

- ノード
- エッジ
- 属性
- 根拠
- 信頼度
- 有効期間
- 承認状態
- 失効状態
- 変更履歴

### 3.10 Retrieval / Query API

AI が回答や判断補助を行う前に、関連サブグラフを取得する。

機能:

- graph query
- vector search
- hybrid search
- shortest path
- neighborhood retrieval
- community retrieval
- evidence ranking
- contradiction lookup
- temporal query
- permission-filtered query

回答前の基本フロー:

```text
User prompt
  -> intent detection
  -> graph query
  -> document retrieval
  -> evidence ranking
  -> context assembly
  -> answer generation
  -> policy check
  -> response
```

### 3.11 Agent Runtime

AI エージェントを実行する環境。

必要な機能:

- conversation state
- tool calling
- memory access
- policy-aware prompting
- model routing
- retry
- interruption
- streaming
- task planning
- subtask execution
- trace logging

金融機関向けでは、agent に資金移動権限を直接持たせない。agent は workflow engine に依頼し、workflow engine が権限と承認を確認して実行する。

### 3.12 Model Router

タスクごとにモデルを選ぶ。

タスク例:

- intent classification
- extraction
- summarization
- answer generation
- reranking
- policy check
- risk explanation
- translation
- voice transcription

選択基準:

- 精度
- レイテンシ
- コスト
- データ保持条件
- リージョン
- 入力長
- 出力安定性
- fallback 可否

本番では、単一モデル依存を避ける。

### 3.13 Workflow Engine

業務フローを決定論的に実行する。

役割:

- 状態管理
- 条件分岐
- 承認待ち
- timeout
- retry
- compensation
- idempotency
- error handling
- audit log

例:

```text
Draft
  -> Validation
  -> ApprovalRequired
  -> Approved
  -> Executing
  -> Completed
  -> Reconciled
```

金融機関向けでは、送金、為替、mint / burn、会計処理は workflow engine の管理下に置く。

### 3.14 Tool Execution Layer

外部システムへの実行を安全に行う層。

役割:

- tool schema 管理
- 入力検証
- 権限確認
- 実行前 dry-run
- 実行
- 結果保存
- error handling
- rollback / compensation
- audit log

接続先:

- CRM
- ERP
- DWH
- ticketing
- email
- document management
- core banking
- FX system
- AML system
- accounting

### 3.15 Policy Engine

業務ルール、禁止事項、承認条件を判定する。

入力:

- user
- role
- tenant
- action
- data scope
- amount
- product
- customer risk
- jurisdiction
- time
- channel

出力:

- allow
- deny
- require_approval
- require_more_information
- escalate
- hold

### 3.16 Supervisor / Guardrail Layer

AI の入出力とツール実行を監督する。

監督対象:

- prompt injection
- data exfiltration
- policy violation
- hallucination risk
- unsupported advice
- unsafe tool call
- high-risk transaction
- privacy leak
- tone / brand mismatch

金融機関向け追加:

- 無登録助言リスク
- 適合性違反
- 説明義務違反
- 制裁回避
- AML 回避
- 顧客属性の誤認
- 不正送金誘導

### 3.17 Evaluation / Simulation

本番前と本番後に品質を評価する。

評価セット:

- golden questions
- high-risk scenarios
- regression cases
- tool failure cases
- ambiguous cases
- adversarial prompts
- compliance scenarios
- customer-specific scenarios

指標:

- answer correctness
- evidence accuracy
- refusal accuracy
- escalation accuracy
- tool call accuracy
- policy pass rate
- latency
- cost
- human override rate

### 3.18 Observability / Audit

運用監視と監査のための機能。

保存、表示するもの:

- request trace
- model call
- retrieved nodes
- retrieved documents
- policy decision
- tool call
- approval decision
- workflow state
- transaction state
- error
- human override
- outcome

金融機関向けでは、内部監査、外部監査、当局説明、事故調査に耐える粒度が必要である。

## 4. 金融機関向け追加コンポーネント

### 4.1 Core Banking Adapter

勘定系と接続する。

機能:

- 残高照会
- 口座状態確認
- 引当
- 振替
- 入出金記録
- 口座名義確認
- 取引履歴取得
- 障害時復旧

原則:

- 勘定系を正本とする
- Token Ledger は実行レイヤー
- すべての token event は勘定イベントと対応させる

### 4.2 Token Ledger

預金トークンや決済用トークンを管理する台帳。

機能:

- mint
- transfer
- burn
- lock
- unlock
- escrow
- atomic execution
- balance query
- event export

要件:

- permissioned network
- participant identity
- key management
- access control
- finality rule
- auditability
- privacy
- scalability
- interoperability

### 4.3 Settlement Control

資金移動の確定条件を管理する。

機能:

- DVP
- PvP
- conditional payment
- escrow
- timeout
- cancellation
- partial failure handling
- settlement state tracking

### 4.4 FX / Hedge Engine

為替とヘッジを管理する。

機能:

- FX quote
- rate lock
- spot
- forward
- swap
- exposure detection
- hedge recommendation
- limit check
- trade booking
- confirmation
- valuation

AI は exposure 抽出や説明補助を行い、約定や booking は決定論的ワークフローで行う。

### 4.5 Compliance Engine

金融犯罪対策と規制チェック。

機能:

- KYC status check
- beneficial owner check
- sanctions screening
- PEP check
- transaction monitoring
- travel-rule-like information handling
- suspicious activity workflow
- case management
- evidence capture

### 4.6 Reconciliation Engine

複数台帳、勘定系、外部システムの突合。

対象:

- Token Ledger
- core banking
- payment instruction
- FX trade
- accounting entry
- customer statement
- external settlement network

機能:

- matching
- break detection
- exception queue
- root cause suggestion
- manual resolution
- audit trail

### 4.7 Accounting / GL Adapter

会計処理と総勘定元帳への連携。

対象:

- token mint
- token burn
- transfer
- fee
- FX trade
- valuation
- settlement
- reversal
- adjustment

## 5. データモデル

### 5.1 共通 Entity

- Tenant
- User
- Role
- Policy
- Document
- Conversation
- Task
- ToolCall
- Approval
- Evidence
- Outcome
- Feedback

### 5.2 業務 Entity

- Customer
- Person
- Company
- Project
- Issue
- Requirement
- Decision
- Preference
- Contract
- Ticket
- Meeting

### 5.3 金融 Entity

- Account
- Wallet
- Beneficiary
- PaymentInstruction
- Transaction
- Token
- TokenMint
- TokenTransfer
- TokenBurn
- FXExposure
- FXQuote
- FXTrade
- HedgePolicy
- SanctionsResult
- AMLAlert
- RiskCase
- LedgerEntry
- ReconciliationBreak

### 5.4 Graph Edge

- mentions
- owns
- controls
- requested_by
- approved_by
- rejected_by
- depends_on
- blocked_by
- caused_by
- contradicts
- similar_to
- evidence_for
- resolved_by
- linked_to
- backed_by
- minted_from
- burned_to
- hedged_by
- reconciled_with
- escalated_to

## 6. データストア

### 6.1 Event Store

用途:

- 追記専用ログ
- 監査
- 再処理
- 評価
- 障害調査

### 6.2 Graph Database

用途:

- ノードとエッジ
- 業務関係
- 証跡
- 矛盾
- 有効期間

### 6.3 Vector Store

用途:

- 文書検索
- 類似ケース検索
- semantic retrieval

Graph DB と Vector Store は競合ではなく併用する。

### 6.4 Relational Store

用途:

- トランザクション状態
- ワークフロー状態
- 権限
- 設定
- 課金
- 管理データ

### 6.5 Object Store

用途:

- 原本ファイル
- PDF
- 音声
- 画像
- 文字起こし
- エクスポート

### 6.6 Ledger

金融機関向け。

用途:

- token balance
- token event
- transfer state
- lock / escrow
- settlement state

## 7. セキュリティ

### 7.1 基本要件

- SSO
- MFA
- RBAC
- ABAC
- tenant isolation
- encryption at rest
- encryption in transit
- audit logging
- secrets management
- data masking
- least privilege

### 7.2 金融機関向け追加

- HSM
- key ceremony
- dual control
- transaction signing
- privileged access monitoring
- tamper-evident logs
- break-glass procedure
- disaster recovery
- cyber incident response

## 8. 運用

### 8.1 環境

- development
- staging
- simulation
- production
- audit replay

### 8.2 変更管理

- versioned workflow
- versioned policy
- versioned prompts
- versioned extraction schema
- model version tracking
- rollback
- approval before release

### 8.3 障害対応

- idempotent retry
- dead letter queue
- compensation workflow
- manual override
- reconciliation
- incident timeline
- customer impact report

## 9. AI ガバナンス

### 9.1 モデル利用原則

- 重要判断は AI 単独にしない
- 根拠を保存する
- モデルバージョンを保存する
- 出力を評価する
- 高リスク領域は承認を必須にする
- 顧客データの利用範囲を制限する

### 9.2 データ利用

- 顧客データは顧客テナント内で利用する
- cross-tenant 学習は匿名化された統計のみ
- 原文、embedding、要約、派生データの所有権を明確化する
- エクスポート可能にする
- 削除要求に対応する

### 9.3 評価

- 本番前評価
- 継続評価
- 人間レビュー
- 失敗ケース収集
- 回帰テスト
- red team

## 10. MVP 技術スコープ

### 10.1 共通プロダクト MVP

- Event Log
- File ingestion
- Chat UI
- Extraction Agent
- Staging Graph
- Committed Graph
- Retrieval API
- Answer with citations
- Feedback capture
- Review Console

### 10.2 金融機関向け MVP

- Back office ingestion
- Invoice / payment instruction extraction
- Financial Graph
- Approval workflow
- AML case memo support
- Reconciliation queue
- Read-only core banking adapter
- Audit trace

### 10.3 次段階

- write-back to systems
- limited token ledger sandbox
- mint / burn simulation
- FX quote integration
- transaction monitoring integration
- controlled production pilot

## 11. 設計原則

本システムの設計原則は以下である。

- AI は候補生成と文脈整理に強く使う
- 資金移動や本番更新は決定論的に実行する
- すべての重要判断に根拠を残す
- 推論と事実を区別する
- 顧客ごとの知識を分離する
- 失敗や修正を改善ループへ戻す
- 既存システムを置き換えず、実行レイヤーとして重ねる
- 規制、監査、運用を最初から組み込む


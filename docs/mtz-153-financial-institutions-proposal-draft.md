# MTZ-153 金融機関向け提案資料ドラフト

作成日: 2026-03-23

## このドラフトの目的

金融機関向け提案資料のたたき台です。中核のアイデアは次の3点です。

- トークン化預金、または規制に乗ったデジタルマネー基盤で、24/7の資金移動レールを作る
- その上に AI agent と policy layer を載せる
- 支払、資金繰り、予実管理、将来的には融資オペレーションまで自動化に近づける

最初に切り分けておくべき点:

- 下の外部根拠は、トークン化預金、ステーブルコイン、programmable payments が立ち上がりつつあることを示している
- 一方で「AI agent が予測、支払実行、与信ワークフローを担う」という部分は、これらの流れから導いたこちらの提案仮説であり、各銀行の公式発言そのものではない

## 一言でいうと

金融機関向けに「AI-native programmable banking layer」を提案する。
実行面はトークン化預金や規制準拠のデジタルキャッシュ基盤が担い、運用面は AI が資金残高を監視し、承認済み支払を実行し、予測精度を上げ、与信判断を補助する。

## なぜ今か

### 1. トークン化預金の商用化が、既に始まっている

- HSBC の Tokenised Deposit Service 公式ページでは、指定預金をデジタルトークンに変換し、wallet 間で即時に移転でき、資金を 24/7 でリアルタイム管理できると説明されている
- HSBC はこの仕組みを、単なる送金機能ではなく、自動化されたワークフローや forecasting 精度向上にもつなげている
- J.P. Morgan の Kinexys も、機関投資家や大企業向けに、near real-time かつ 24/7 の programmable な資金移動を打ち出している

### 2. SMBC も、この方向に踏み込み始めている

- 2025-04-02 に SMBC Group、SMBC、TIS、Ava Labs、Fireblocks は、ステーブルコインの商用化に向けた共同検討を公表した
- このリリースでは、トークン化金融資産、RWA、送金、企業間決済、小口高頻度決済などの活用領域が明示されている
- 2025-03-14 には、SMBC がデジタル社債の発行と、DCJPY を用いた証券決済 PoC を公表している
- 同リリースでは、DCJPY を tokenized deposits を表現する digital currency と位置付け、STP、同日またはリアルタイム決済、自動クーポン支払などの可能性にも触れている

### 3. 規制・中央銀行サイドも、機会と制約の両方を認識している

- EBA は 2024-12-12 の公表で、トークン化預金の利点として programmability と transfer automation を挙げている
- 同時に、consumer protection、operational risk、AML / CFT を主要論点として挙げている
- 日本銀行の 2024-12-13 の講演では、Project Agora を通じて中央銀行預金と民間銀行預金の tokenization を共通基盤上で検討する方向性が語られている

## 8枚構成の提案ストーリー

### 1. エグゼクティブメッセージ

伝えたいこと:
金融機関は「既存銀行システムの上にデジタルチャネルを載せる段階」から、「お金と業務と意思決定がつながった programmable banking infrastructure」を提供する段階へ進める。

話し方の軸:

- 企業向け金融は、依然として cut-off time、分断されたシステム、手作業の treasury に縛られている
- tokenized deposits は execution layer を変える
- AI agents は operating layer を変える

### 2. 現状課題

伝えたいこと:
法人顧客は、いまも次の3つの構造課題を抱えている。

- ビジネスイベントが起きた瞬間に、お金が動けない
- treasury、販売管理、会計、受発注のシグナルが分断されている
- 融資審査やリスクレビューが、実際の事業状況に遅れて到着する

言い回し例:
「銀行は残高を見ており、ERP は受注を見ており、経理は予測を見ている。しかし、その3つを継続的につなぐ operating layer がない」

### 3. 市場の転換点

伝えたいこと:
これは将来構想だけの話ではなく、すでに大手金融機関が payment rail を実装し始めている。

- HSBC: tokenized deposits、24/7 transfers、automated workflows、forecast visibility
- J.P. Morgan Kinexys: programmable、near real-time、24/7 の cross-border / intragroup funding
- SMBC: ステーブルコイン商用化の検討と、tokenized-deposit 型 digital currency を使った証券決済の実験

入れると良い図:
日付つきタイムライン

- 2024-12-12 EBA report
- 2024-12-13 BOJ speech
- 2025-03-14 SMBC digital bond / DCJPY PoC
- 2025-04-02 SMBC stablecoin MoU
- 2025 HSBC / J.P. Morgan commercialization examples

### 4. 提案ソリューション

伝えたいこと:
銀行が提供すべきものは、2層構造のプラットフォームである。

Layer 1: regulated digital money execution layer

- トークン化預金、または規制準拠デジタルマネー
- 24/7 transfer / settlement
- programmable rules
- 全件監査可能な ledger

Layer 2: AI operating layer

- cash forecasting agent
- payment recommendation / execution agent
- reconciliation / exception-handling agent
- lending / underwriting support agent

位置付けの言い方:
「銀行口座という商品を売るのではなく、programmable financial operating system を提供する」

### 5. 主要ユースケース

伝えたいこと:
最初は treasury と payments の自動化から始め、そこから lending と業務埋め込みに広げる。

ユースケース A: 法人 treasury

- グループ企業間の liquidity auto-sweep
- 閾値やイベントに応じた承認済み transfer 実行
- trapped cash や idle balance の削減

ユースケース B: 予実管理と経営オペレーション

- payment flows、売掛、買掛、受発注イベントを結合
- cash / working capital forecast を継続更新
- 資金ショートや covenant stress を事前アラート

ユースケース C: 融資・与信ワークフロー

- 実運用に近い cash data を credit monitoring に反映
- 当座貸越、SCF、短期融資の review cycle を短縮
- いきなり full automation は狙わず、まずは recommendation mode から始める

### 6. 銀行にとっての価値

伝えたいこと:
これは単なる payment feature ではなく、預金、決済、融資をまとめて再設計する product architecture である。

- 法人預金の stickiness 向上
- premium automation や API 利用料による新しい fee layer
- underwriting や treasury cross-sell に効く高頻度データ
- 顧客業務が銀行 workflow layer に埋め込まれることで、離脱しにくくなる

### 7. 統制とリスク設計

伝えたいこと:
勝ち筋は「完全自律の money movement」ではなく、「policy control 付き programmable money」である。

- permissioned infrastructure
- KYC / KYB / AML controls
- role-based approvals
- transaction limits / whitelists
- 例外時と credit judgement における human-in-the-loop
- recommendation と action の完全監査ログ

注意点:
最初の提案で「与信審査の完全自動化」を前面に出しすぎない。
安全な言い方は:
「AI-assisted underwriting と continuous risk monitoring を、人の承認フロー付きで提供する」

### 8. パイロット提案

伝えたいこと:
最初は狭く、測定可能な pilot から入る。

Phase 1: treasury / payment pilot

- 対象は 1-3 社の法人顧客、または銀行内 treasury
- intragroup funding、cash concentration、時間外支払を対象にする
- 成功指標は settlement speed、manual work 削減、forecast accuracy、operational error 削減

Phase 2: workflow integration

- ERP / TMS / payment approval system と接続
- reconciliation agent、forecasting agent を追加

Phase 3: credit expansion

- transaction data と cash-flow data を lending workflow に接続
- まずは narrow な credit product、または monitoring workflow で検証

## 口頭で強く言いたいメッセージ

- 「tokenized deposits が execution bottleneck を解く」
- 「AI agents が operating bottleneck を解く」
- 「両者が組み合わさると、銀行は transaction processor から financial workflow orchestrator に進化できる」
- 「最初の勝ち筋は treasury automation。長期の勝ち筋は underwriting と transaction relationship の深掘り」

## 過剰に言わないほうがよいこと

- tokenized deposits だけで credit automation が完成するかのような言い方
- tokenized deposits、stablecoins、CBDC を同じものとして扱うこと
- 規制論点がすでに完全に解決済みだという見せ方
- control gate なしの full autonomy を匂わせること

## 次の作業候補

1. これを SMBC 向けなど、個社前提のバージョンに寄せる
2. `MTZ-154` の ATFIO 整理を取り込み、何者として提案するかを明確にする
3. この 8 枚構成を実際のスライドに落とし、タイムライン図とアーキテクチャ図を作る
4. 初回面談向けに 1 ページ版も用意する

## ソースメモ

### 使った一次情報

- HSBC Tokenised Deposit Service:
[https://www.business.hsbc.com/en-gb/solutions/tokenised-deposit-service](https://www.business.hsbc.com/en-gb/solutions/tokenised-deposit-service)
- HSBC の Ant International 事例:
[https://www.business.hsbc.com/en-gb/insights/client-stories/ant-international](https://www.business.hsbc.com/en-gb/insights/client-stories/ant-international)
- J.P. Morgan Kinexys overview:
[https://www.jpmorgan.com/insights/payments/payment-trends/introducing-kinexys](https://www.jpmorgan.com/insights/payments/payment-trends/introducing-kinexys)
- J.P. Morgan / Axis Bank の 24/7 USD clearing announcement:
[https://www.jpmorgan.com/payments/newsroom/axis-bank-usd-clearing-kinexys](https://www.jpmorgan.com/payments/newsroom/axis-bank-usd-clearing-kinexys)
- SMBC stablecoin MoU news release, 2025-04-02:
[https://www.smbc.co.jp/news_e/pdf/e20250402_01.pdf](https://www.smbc.co.jp/news_e/pdf/e20250402_01.pdf)
- SMBC digital bond and DCJPY PoC news release, 2025-03-14:
[https://www.smbc.co.jp/news_e/pdf/e20250314_03.pdf](https://www.smbc.co.jp/news_e/pdf/e20250314_03.pdf)
- EBA press release on tokenized deposits, 2024-12-12:
[https://www.eba.europa.eu/publications-and-media/press-releases/eba-assesses-potential-benefits-and-challenges-tokenised-deposits](https://www.eba.europa.eu/publications-and-media/press-releases/eba-assesses-potential-benefits-and-challenges-tokenised-deposits)
- Bank of Japan speech on the future of payments, 2024-12-13:
[https://www.boj.or.jp/en/about/press/koen_2024/ko241213a.htm](https://www.boj.or.jp/en/about/press/koen_2024/ko241213a.htm)

### どこまでが事実で、どこからが提案仮説か

- 「24/7 programmable payment rail が現実化しつつある」は HSBC、J.P. Morgan、SMBC の公式発表で裏付けられる
- 「AI agent layer により forecasting / approvals / underwriting を高度化する」は、今回の提案仮説
- 「スピードだけでなく統制設計が重要」は、EBA の論点整理と SMBC の PoC 上の示唆に整合する


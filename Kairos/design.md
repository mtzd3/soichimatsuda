# KairosAI Executive Presentation System

Version: 1.0  
Updated: 2026-06-22  
Status: Authoritative entry point  
Scope: 経営会議、政策提言、投資判断、事業戦略、技術戦略

## 1. このシステムの目的

KairosAIの資料を「情報を並べたスライド」から「意思決定を前へ進める経営資料」へ変える。

目標品質は、戦略コンサルティング会社の資料に見られる次の特性である。

- 結論が先に読める
- タイトルだけでストーリーが通る
- 根拠、示唆、提言、意思決定が分離されている
- 情報量が多くても、視線の順番が一意である
- 図表が装飾ではなく論証として機能する
- 本編と付録の役割が明確である
- PowerPointとGoogle Slidesの双方で編集・再利用できる

PwC等のブランドを模倣するものではない。参照するのは、白地を活かした階層、強いアクセント、結論先行、数値の焦点化、編集された余白などのプロフェッショナルな設計原則である。

## 2. 最上位原則

### 2.1 Answer first

スライドタイトルはトピック名ではなく、そのページで証明する結論を書く。

悪い例:

> GPUクラスタ

良い例:

> 初期フェーズはGPUで需要を作り、専用半導体の投資判断に必要な実績を蓄積する

### 2.2 One slide, one job

各スライドの役割は次の一つに限定する。

- `ANSWER`: 結論を示す
- `EVIDENCE`: 結論を根拠で支える
- `CHOICE`: 選択肢を比較する
- `PLAN`: 実行順序を示す
- `DECISION`: 求める判断を明示する

一枚で複数の役割を担う場合は分割する。

### 2.3 Evidence before decoration

- 図形は情報構造を示す場合だけ使う
- 色は意味を持つ場合だけ使う
- アイコンは識別を速める場合だけ使う
- 空白は情報のグループと優先順位を示すために使う

### 2.4 Main deck and appendix

- 本編は意思決定に必要な論理だけを残す
- 詳細定義、全項目、計算前提、参考資料は付録へ移す
- 本編の標準は15〜25枚
- 30枚を超える場合は、原則として付録化または別冊化を検討する

### 2.5 Edit before shrink

文字が収まらない場合の順番:

1. 重複を削る
2. 文を短くする
3. 表や図へ構造化する
4. スライドを分割する
5. 付録へ移す

フォント縮小は最後の手段である。本編本文は17pt以上、表・付録は14pt以上を維持する。

## 3. 標準ページ構造

通常ページは上から次の順に構成する。

1. `Action title`: 結論タイトル
2. `Lead`: タイトルを補足する1〜2行
3. `Evidence field`: 図、表、比較、プロセス、本文
4. `So what`: 必要な場合だけ置く示唆・決定事項
5. `Footer`: 出典、機密区分、ページ番号

視線は左上から右下へ一方向に流す。重要度の低い情報を上段へ置かない。

## 4. ビジュアルコンセプト

### Executive Momentum

KairosAIの表現は、次の四要素を組み合わせる。

- **Decisive**: 結論と判断事項が明快
- **Institutional**: 政策・重要インフラを扱える信頼感
- **Technical**: AI、半導体、電力、データを精密に扱う
- **Forward-moving**: 現在地から実装へ進む勢いがある

目指す印象は「静かな精度と前進」である。

避ける印象:

- サイバー風
- スタートアップの販促資料風
- UIダッシュボード風
- テンプレートへ文章を詰め込んだ資料
- 色とカードで情報量をごまかした資料

## 5. デザイン言語

### 5.1 基本構成

- 白または温かいオフホワイトを主背景とする
- 黒に近い濃色で見出しを作る
- オレンジ系アクセントを「判断・前進・重要箇所」に限定する
- カテゴリ色はフレームワークでのみ使用する
- 左端の短い縦バー、細い横罫線、直接ラベルを主要モチーフとする

### 5.2 参照デッキから継承する要素

- 結論を文章で書く大きなタイトル
- タイトル左のセクションアクセント
- タイトル下の短い要約文
- 3本柱、2層比較、ロードマップ、レイヤー構造の反復
- ページ下部の明確な「So what」
- 表の暗色ヘッダーとバンド行

### 5.3 継承しない要素

- 12pt本文の常用
- 影付きカードの多用
- 一枚に6個以上の箱を並べること
- 長文をそのまま箇条書きへ流し込むこと
- セクションごとに無制限に色を増やすこと
- 結論、前提、補足、注記を同じ強さで表示すること

## 6. ファイル構成

詳細仕様は以下を正本とする。

| ファイル | 役割 |
| --- | --- |
| [design-system/README.md](design-system/README.md) | 読み方、優先順位、運用 |
| [design-system/01-foundations.md](design-system/01-foundations.md) | ブランド、色、文字、グリッド |
| [design-system/02-story-architecture.md](design-system/02-story-architecture.md) | デッキ全体の論理構成 |
| [design-system/03-slide-archetypes.md](design-system/03-slide-archetypes.md) | 標準スライド型 |
| [design-system/04-layout-system.md](design-system/04-layout-system.md) | ページ内レイアウトと部品 |
| [design-system/05-data-and-evidence.md](design-system/05-data-and-evidence.md) | グラフ、表、数値、出典 |
| [design-system/06-writing-system.md](design-system/06-writing-system.md) | タイトル、本文、表現 |
| [design-system/07-production-workflow.md](design-system/07-production-workflow.md) | 制作手順 |
| [design-system/08-quality-gates.md](design-system/08-quality-gates.md) | レビューと合格基準 |
| [design-system/09-design-tokens.md](design-system/09-design-tokens.md) | 機械実装用token |
| [design-system/10-layout-wireframes.md](design-system/10-layout-wireframes.md) | 標準配置のワイヤーフレーム |
| [design-system/11-lecture-deck-system.md](design-system/11-lecture-deck-system.md) | 経産省型の因果説明を参照した講義資料の構成 |
| [design-system/templates/deck-brief.md](design-system/templates/deck-brief.md) | デッキ企画テンプレート |
| [design-system/templates/slide-spec.md](design-system/templates/slide-spec.md) | 1枚ごとの設計テンプレート |
| [design-system/templates/deck-review.md](design-system/templates/deck-review.md) | レビューテンプレート |
| [design-system/references/reference-deck-analysis.md](design-system/references/reference-deck-analysis.md) | 参照デッキの分析 |
| [design-system/references/sources.md](design-system/references/sources.md) | 参考資料と適用範囲 |

## 7. 制作時の必須読込

### 小規模修正

1. このファイル
2. `01-foundations.md`
3. 対象となるスライド型
4. `08-quality-gates.md`

### 新規デッキ

1. このファイル
2. `02-story-architecture.md`
3. `03-slide-archetypes.md`
4. `01-foundations.md`
5. `05-data-and-evidence.md`
6. `06-writing-system.md`
7. `07-production-workflow.md`
8. `08-quality-gates.md`

### レクチャー資料

1. このファイル
2. `11-lecture-deck-system.md`
3. `02-story-architecture.md`
4. `03-slide-archetypes.md`
5. `05-data-and-evidence.md`
6. `06-writing-system.md`
7. `08-quality-gates.md`

## 8. 合否を決める5つの質問

各スライドは、次の質問すべてに答えられなければ完成ではない。

1. このページの結論は何か
2. その結論を支える証拠は何か
3. 読み手は何を理解・判断すべきか
4. なぜこのレイアウトが最適か
5. 削除しても意味が変わらない要素は残っていないか

## 9. 例外ルール

- 法令、契約、技術仕様など文言維持が必要な場合は、本文を縮小せず付録へ移す
- 一覧性が価値となる場合だけ高密度表を許容する
- 既存テンプレートを使用する場合も、内容に合わないレイアウトへ無理に流し込まない
- ブランド色よりも、可読性と意味の正確さを優先する

## 10. Authority

ルールが競合する場合の優先順位:

1. 正確性、出典、法的・技術的要件
2. 意思決定ストーリー
3. 可読性とアクセシビリティ
4. 本デザインシステム
5. 既存スライドの見た目

既存資料が本ルールと矛盾する場合、既存資料を正解とみなさない。

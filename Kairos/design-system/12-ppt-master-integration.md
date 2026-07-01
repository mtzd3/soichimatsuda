# 12. PPT Master Integration

この章は、PPT Masterから取り込む設計要素をKairosAIの資料制作へ適用するための運用仕様である。

目的は、外部の見た目を複製することではない。KairosAIの既存トーンを保ったまま、編集可能なPPTXを安定して生成するための制作規律、テンプレート構造、品質確認を取り込む。

## 1. Adopted principles

取り込む要素:

- Native editable output: 図形、文字、表、矢印を可能な限りPowerPoint上で編集可能に保つ
- Spec lock: 色、フォント、余白、ページリズム、画像、アイコンを生成前に固定する
- Brand / layout / deck separation: ブランド要素と構造要素を分け、衝突時の優先順位を明示する
- Page rhythm: 同じ密度と同じ型が続かないよう、ページへリズム属性を付ける
- Template path discipline: テンプレートは明示パスで指定されたときだけ使う
- Visual review: 生成後は静的チェックと画像チェックを分けて行う
- Animation optionality: ページ遷移や要素アニメーションは、目的がある場合だけ有効化する
- Speaker notes as deliverable: 読み上げ、説明、動画化を想定する資料ではノートを成果物に含める

取り込まない要素:

- Memphis、cyberpunk、glassmorphismなどの強い装飾スタイル
- 影、発光、派手なグラデーションを標準化すること
- テンプレート名の曖昧な推測
- スライドを一枚画像として貼り込むだけのPPTX
- 根拠のない外部調査や事実の補完

## 2. Template segment model

KairosAIでは、テンプレートを次の3種類へ分ける。

| Kind | 役割 | KairosAIでの例 | 変更してよい範囲 |
| --- | --- | --- | --- |
| `brand` | 色、書体、ロゴ、言語姿勢、アイコン方針 | `brand/`のロゴ、core palette、writing system | レイアウト構造は持たない |
| `layout` | 画面比率、余白、ページ型、SVG/ワイヤーフレーム | archetype、wireframe、標準座標 | ブランド色やロゴは持たない |
| `deck` | brandとlayoutが一体化した完成基準 | 投資家向けデッキ、政策向け説明資料 | 必要時だけsegment単位で上書きする |

優先順位:

1. 明示されたユーザー指定
2. `brand` segment
3. `layout` segment
4. `deck` segment
5. KairosAI標準値

同じkindが複数ある場合、暗黙の順序で混ぜない。色、書体、ロゴ、構造のどのsegmentを採用するかを記録する。

## 3. Spec lock

`design_spec`は意図を説明する文書である。`spec_lock`は実装が読む固定値である。

新規デッキでは、代表5枚を作る前に`templates/spec-lock.md`を複製し、少なくとも次を固定する。

- Canvas: 比率、サイズ、viewBox、余白
- Typography: title、lead、body、table、source、page number
- Color: canvas、surface、ink、text、muted、line、accent、semantic colors
- Layout: 使用するarchetype、grid、footer位置
- Page rhythm: `anchor` / `dense` / `breathing`
- Assets: 画像、ロゴ、アイコン、出典
- Export: PPTX、Google Slides、PDF、SVG snapshotの要否
- Motion: page transition、element animation、narrationの要否

長いデッキを生成する場合、各ページ作成前に`spec_lock`を読み直す。記憶や前ページの値から色、フォント、座標を再推測しない。

## 4. Page rhythm

ページごとに、archetypeとは別にリズムを指定する。

| Rhythm | 用途 | 密度 | 典型 |
| --- | --- | --- | --- |
| `anchor` | 結論、章の転換、重要判断 | 低〜中 | cover、executive answer、decision request |
| `dense` | 証拠、表、比較、前提 | 中〜高 | chart、table、matrix、appendix |
| `breathing` | 読み手の理解をリセットする | 低 | section divider、大型メッセージ、単一図解 |

標準ルール:

- `dense`を3枚以上連続させない
- `breathing`は装飾ページではなく、理解の間を作るページとして使う
- `anchor`では主張を一つに絞り、複数カードを避ける
- 同一archetypeが4枚続く場合、リズムまたは構成を変える

## 5. Native editable construction

PPTX化する資料では、次を標準とする。

- テキストは選択可能なテキストボックスとして残す
- 図解は可能な限り線、図形、テキストで組む
- グラフは元データ、単位、期間を残す
- 画像は証拠、人物、プロダクト、実物の説明に使う
- 装飾目的の大きなラスター画像で情報を固定しない

SVG経由で作る場合の追加ルール:

- viewBoxは`1280 720`を標準とする
- top-level groupは意味単位で3〜8個にする
- chrome groupは`background`、`header`、`footer`、`logo`、`rule`などの名前で分ける
- 色はHEX tokenから使い、RGBAや任意色を増やさない
- 文字、罫線、図形はできるだけ個別編集できる粒度で出す

## 6. Template routing

テンプレートは、明示されたディレクトリパスがある場合だけ使う。

| 入力 | 扱い |
| --- | --- |
| `templates/layouts/kairos_policy_brief/`のような実パス | テンプレートとして読む |
| 「コンサル風」「Swiss grid風」 | style briefとして扱う。テンプレートは読まない |
| 「前回のPPTをテンプレートにして」 | 先にtemplate化または手動抽出を行う |
| 既存PPTXのページ数と文言を保つ | beautify / re-layout扱い。ストーリー再設計しない |
| 既存PPTXを材料に新しい構成へ作り直す | source扱い。ページ順と枚数は再設計可能 |

曖昧な「いい感じに整えて」は、最初に次だけ判定する。

1. ページ数、順序、文言を維持するか
2. 内容を材料として再構成してよいか

## 7. Visual style import

KairosAI標準へ相性がよいPPT Master系スタイルは次の2つに限定する。

### Swiss minimal

使う場面:

- 経営判断
- 投資家向け要約
- 章扉
- one-messageページ

取り込む要素:

- 厳密なグリッド
- 強い余白
- 角丸をほぼ使わない
- 一点だけのアクセント
- タイトルと本文の明確なサイズ差

### Data journalism

使う場面:

- 市場分析
- KPI
- 資本政策
- 比較表
- 根拠が多い政策説明

取り込む要素:

- 細い罫線
- 大きな数字
- 注釈と出典の近接
- 複数小チャートの整列
- 色を意味で使い、装飾で使わない

上記以外のスタイルは、個別デッキの明示要望がある場合だけ検討する。

## 8. Motion and narration

KairosAIの標準は静的資料である。動きは意思決定を助ける場合だけ使う。

| 機能 | 標準 | 使う条件 |
| --- | --- | --- |
| Page transition | fadeまたはnone | 章の切り替えを滑らかに見せる |
| Element animation | off | ライブ説明で段階的に明かす必要がある |
| On-click reveal | off | 講演、教育、複雑な因果説明 |
| Auto advance | off | 録画、展示、デモループ |
| Narration | optional | 非同期共有、動画化、講義資料 |

アニメーションを使う場合も、内容の理解順を制御するために使う。装飾目的の動きは使わない。

## 9. Quality checks

PPT Master要素を使うデッキでは、既存のQuality Gatesに加えて次を確認する。

- `spec_lock`にない色、フォント、アイコンを使っていない
- 生成後PPTXで各要素が編集可能である
- 画像化された1枚スライドになっていない
- `anchor` / `dense` / `breathing`が意図どおり並んでいる
- 出典、注記、ページ番号がchromeとして安定している
- SVG snapshotとnative PPTXの見た目が大きく乖離していない
- Google Slides変換でフォント、罫線、図形が崩れていない

## 10. Source attribution

この統合は、hugohe3/ppt-masterの公開リポジトリ、ドキュメント、テンプレートアーキテクチャ、技術設計から抽出した制作思想をKairosAI向けに再構成したものである。ライセンス、スクリプト、テンプレートファイル自体を取り込む場合は、元リポジトリのライセンスと帰属表示を確認する。

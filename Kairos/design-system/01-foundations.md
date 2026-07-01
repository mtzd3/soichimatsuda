# 01. Foundations

## 1. Visual position

KairosAIの資料は、政策・経営・技術を横断する。したがって、デザインは「未来感」より「信頼できる判断」を優先する。

基本トーン:

- 余白がある
- 線が細い
- 文字が強い
- 色数が少ない
- 数字が大きい
- 構造が明確

## 2. Canvas and grid

| 項目 | 標準 |
| --- | --- |
| 比率 | 16:9 |
| 基準 | 1280 × 720 px |
| 左右余白 | 48〜64 px |
| 上余白 | 32〜44 px |
| 下余白 | 32〜40 px |
| カラム | 12 |
| ガター | 20〜24 px |
| 基本単位 | 8 px |

タイトル、本文、図表の左端を同じグリッドへ揃える。

主要な垂直基準線は1ページ最大4本とする。箱ごとに別の左端を作らない。

## 3. Typography

### Font family

| 用途 | 標準 | フォールバック |
| --- | --- | --- |
| 日本語・英数字 | Noto Sans JP | Arial, sans-serif |
| 数値・コード | Noto Sans Mono | Roboto Mono, monospace |
| Editorial accent | 使用しない | - |

一つのデッキでフォントファミリーは最大2種類。

### Type scale

| 要素 | 標準 | 最小 |
| --- | ---: | ---: |
| 表紙タイトル | 56 pt | 50 pt |
| 章扉タイトル | 44 pt | 40 pt |
| Action title | 36 pt | 32 pt |
| 大型メッセージ | 44 pt | 40 pt |
| パネル見出し | 22 pt | 20 pt |
| 本文 | 19 pt | 17 pt |
| 表・グラフ | 16 pt | 14 pt |
| 出典・注記 | 11 pt | 10 pt |
| ページ番号 | 10 pt | 9 pt |

本編本文は17pt未満にしない。表・付録の高密度領域でも14pt未満にしない。

### Hierarchy

- Title: Bold
- Lead: Regular
- Subhead: Bold
- Body: Regular
- Label: MediumまたはBold
- Source: Regular

強調は太字を第一選択とする。色のみで強調しない。

## 4. Color roles

### Core palette

| Token | Hex | 用途 |
| --- | --- | --- |
| `canvas` | `#FAF9F7` | 標準背景 |
| `surface` | `#FFFFFF` | 表・図の面 |
| `ink` | `#20242A` | タイトル、強い本文 |
| `text` | `#4A5563` | 通常本文 |
| `muted` | `#77808C` | 補助情報 |
| `line` | `#D9D4CE` | 罫線 |
| `soft-fill` | `#F1EFEC` | 淡い区分 |
| `accent` | `#E45B1B` | 判断、前進、焦点 |
| `accent-dark` | `#A83E17` | 強いアクセント |

### Framework palette

| Token | Hex | 意味 |
| --- | --- | --- |
| `navy` | `#315F7D` | AI・データ、公共性 |
| `sage` | `#637A68` | 基盤、継続、運用 |
| `plum` | `#7B6C79` | 統治、権利、制度 |
| `gold` | `#C99A2E` | 経済価値、ゲート |
| `risk` | `#A43E3E` | リスク、停止条件 |

カテゴリ色はフレームワーク内の同一概念へ一貫して割り当てる。ページごとに意味を変えない。

## 5. Color ratio

- 75〜85%: canvas / surface
- 10〜20%: ink / text / line
- 5〜10%: accentまたはframework color

一枚で主役となるアクセントは一色。

## 6. Lines and surfaces

- 外枠: 1px相当
- 強調線: 4〜8px相当
- タイトル左バー: 8px相当、長さ48〜64px
- タイトル下罫線: 1px
- 角丸: 原則0、使う場合4px相当
- 影: 原則禁止
- グラデーション: 表紙または章扉のみ

## 7. Accessibility

- 本文コントラスト4.5:1以上
- 大型文字3:1以上
- 色だけで状態を表さない
- 赤と緑だけの良否表現を避ける
- 読み順を左上から右下へ保つ
- 重要な注記を極端に小さくしない

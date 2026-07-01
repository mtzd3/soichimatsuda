# Reference Deck Analysis

Reference: `ATFIO_霞ヶ関向け簡易スライド_v1.3`  
Slides: 27  
Reviewed: 2026-06-22

## 1. Extracted visual grammar

### Repeated page structure

1. 左端の縦アクセント
2. 大きな左揃えタイトル
3. タイトル下の横罫線
4. 1〜2行のLead
5. 構造化された証拠領域
6. ページ下部の機密区分とページ番号

この一貫性は、資料を「同じ組織が作ったもの」に見せるうえで有効。

### Main layout families

- Minimal cover
- Portrait + profile
- Executive summary
- Three-pillar framework
- 2×3 taxonomy
- Layered architecture
- Process / learning loop
- Table + implication
- Roadmap + policy actions
- Public / commercial comparison
- Problem / solution comparison
- Five-step value capture
- Appendix divider

## 2. What works

### Conclusion-led titles

多くのページで、タイトルが説明対象ではなく主張になっている。これはコンサルティング資料として最も重要な特性。

### Strong section identity

縦バーの色によって章の系列を識別できる。色が構造を示している。

### Repeated archetypes

3本柱、階層、比較、Phaseが繰り返され、読み手がページ構造を学習できる。

### Explicit implications

下部の濃色帯や強調パネルで、ページの含意を明示している。

### Business and technical integration

技術アーキテクチャ、政策、経済価値を同じビジュアル言語で扱っている。

## 3. What needs correction

### Excessive density

12pt前後の本文、長い箇条書き、7ステップ以上の工程があり、投影時の可読性が不足する。

対応:

- 本文17pt以上
- 長文を付録へ
- 代表実績を3〜5点へ編集
- 一枚の役割を限定

### Card overuse

多くの情報が枠内へ入り、重要度の差が弱くなる。

対応:

- パネルは2〜3個を標準
- 影を削除
- borderまたはkeylineで区分
- 箱の外へ結論を置く

### Visual noise

影、太い帯、複数の枠線、色面が同時に使われるページがある。

対応:

- 面、線、色のうち主役は一つ
- So-what bandは必要なページだけ
- 重複する囲みを削る

### Title and content collision

一部ページでは上部に残存テキストが重なっている。これはテンプレート流用時の重大なQA欠陥。

対応:

- inherited placeholderを確認
- 全ページのthumbnail QA
- タイトル領域へ他要素を置かない

### Too many category colors

章色と意味色が混在する。

対応:

- accentは判断
- navy/sage/plumは固定カテゴリ
- risk/goldは状態

## 4. Elements adopted into KairosAI

| Reference element | KairosAI adaptation |
| --- | --- |
| Left vertical accent | 8px title bar |
| Strong title | 36pt action title |
| Thin title rule | 1px neutral rule |
| Three-pillar cards | A06 with no shadow |
| 2×3 taxonomy | A07 with shorter copy |
| Layer stack | A08 with ownership/implication |
| Bottom dark band | Optional So-what band |
| Roadmap phases | A10 with exit criteria |
| Dark table header | A13 with reduced gridlines |

## 5. Elements explicitly rejected

- 12pt body as standard
- emoji status symbols
- drop shadows
- six or more content cards
- decorative numbering
- long biography lists
- full-page confidentiality text when not required
- multiple conclusions in one title

## 6. Design conclusion

参照デッキは「論理の型」が強く、「編集と視覚整理」が弱い。KairosAIでは、型を継承し、密度、余白、文字、色、QAをプロフェッショナル水準へ引き上げる。

# 08. Quality Gates

各ゲートを通過しない限り、次工程へ進まない。

## Gate 1: Decision clarity

- [ ] 読み手と会議が明確
- [ ] 求める判断が一文で書ける
- [ ] Executive answerが冒頭3枚以内にある
- [ ] 最終ページがdecision requestになっている

## Gate 2: Storyline

- [ ] タイトルだけで論理が通る
- [ ] 1スライド1job
- [ ] 理由がMECEに近い
- [ ] 結論と根拠が対応している
- [ ] 本編と付録が分離されている

## Gate 3: Evidence

- [ ] 重要主張に出典がある
- [ ] Fact / estimate / hypothesisが区別されている
- [ ] 数値の期間と単位がある
- [ ] 比較対象が明確
- [ ] 推計前提が付録にある

## Gate 4: Writing

- [ ] タイトルが結論文
- [ ] Leadがタイトルの言い換えではない
- [ ] 箇条書きが5点以内
- [ ] 文法と語尾が揃っている
- [ ] 曖昧な「検討」「連携」「推進」が具体化されている

## Gate 5: Visual hierarchy

- [ ] 最初に見る場所が一つ
- [ ] タイトルが最も強い
- [ ] 主役となる証拠が一つ
- [ ] 色の意味が一貫
- [ ] 不要な箱、線、影がない

## Gate 6: Layout

- [ ] 左右余白が一定
- [ ] タイトル、Lead、主図表が揃っている
- [ ] 反復要素の幅・高さが揃っている
- [ ] 本文17pt以上
- [ ] 表・グラフ14pt以上
- [ ] 重なり、切れ、はみ出しがない

## Gate 7: Deck rhythm

- [ ] 同じレイアウトが4枚以上連続していない
- [ ] 3〜5枚ごとに視覚的変化がある
- [ ] 章扉が必要箇所にある
- [ ] 高密度ページが連続していない
- [ ] 付録の見た目が本編と区別されている

## Gate 8: Compatibility

- [ ] PowerPointで確認
- [ ] Google Slidesで確認
- [ ] PDFで確認
- [ ] フォント置換がない
- [ ] 空プレースホルダーがない
- [ ] 編集可能な要素が維持されている

## Gate 9: Generation contract

- [ ] `spec-lock`にcanvas、color、typography、assets、export routeがある
- [ ] 各ページに`anchor` / `dense` / `breathing`が指定されている
- [ ] `spec-lock`外の色、フォント、アイコンを使っていない
- [ ] 画像一枚貼りのスライドになっていない
- [ ] SVG経由の場合、top-level groupが意味単位で分かれている
- [ ] animation / narrationが必要なページだけに限定されている
- [ ] native PPTXとPDFの代表ページが目視一致している

## Red flags

一つでも該当すれば要修正。

- タイトルが「概要」「現状」「検討事項」
- 12pt本文
- 5個以上のカード
- 影付きの箱が多数
- 6色以上
- 出典のない数字
- タイトルより強い下部帯
- 文章が図形の端へ接近
- 一枚で結論が二つ
- 「So what」が書けない
- `spec-lock`なしで生成を始める
- テンプレート名だけで暗黙にテンプレートを選ぶ
- native PPTXで文字や図形が編集できない
- 高密度ページが3枚以上続く

## Review score

各項目を0〜2点で採点する。

| 項目 | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Decision | 不明 | 推測可能 | 明示 |
| Story | 断片的 | 一部接続 | 一貫 |
| Evidence | 無根拠 | 一部根拠 | 追跡可能 |
| Writing | 冗長 | 概ね明快 | 簡潔 |
| Visual | 混雑 | 許容 | 明快 |
| Compatibility | 未確認 | 一部確認 | 全確認 |
| Generation | 未固定 | 一部固定 | `spec-lock`準拠 |

合格基準:

- 合計12点以上
- 0点の項目がない
- DecisionとEvidenceは必ず2点

# 07. Production Workflow

## Phase 0: Brief

`templates/deck-brief.md`を複製し、次を確定する。

- 読み手
- 会議
- 判断事項
- 制約
- 根拠
- ページ数
- 機密区分
- delivery purpose: `text` / `balanced` / `presentation`
- source divergence: 原資料へどの程度忠実にするか
- template route: free design / brand / layout / deck / PPTX preserve

## Phase 1: Storyline

1. 中心結論を書く
2. 支持理由を3〜5点へ分ける
3. 必要な証拠を割り当てる
4. 実行と意思決定で閉じる
5. タイトルだけでレビューする

この段階ではデザインしない。

## Phase 2: Slide specification

各ページに`templates/slide-spec.md`を使う。

最低限:

- role
- action title
- evidence
- archetype
- page rhythm
- source
- so what

## Phase 3: Spec lock

`templates/spec-lock.md`を複製し、実装値を固定する。

最低限:

- canvas、grid、margin
- color token
- typography
- footer
- archetype roster
- page rhythm
- asset inventory
- export route

`spec-lock`にない色、フォント、アイコン、画像を実装時に足さない。足す必要が出た場合は、先に`spec-lock`を更新する。

## Phase 4: Representative set

最初に5枚だけ作る。

1. Cover
2. Executive answer
3. 標準論証
4. 高密度ページ
5. Chartまたはroadmap

この5枚で、文字、余白、色、フッター、情報密度を確定する。

## Phase 5: Build

手動でPowerPoint / Google Slidesを作る場合は、ページ番号順ではなく同じarchetypeごとに作る。

例:

1. A04を作る
2. A05を作る
3. A10を作る
4. A13を作る

同じファミリーをまとめて作ることで、位置と表現を揃える。

SVG / PPT Master型の生成パイプラインを使う場合は、`spec-lock`を各ページ前に読み直し、ページ番号順に作る。長いデッキであっても、前ページの記憶だけで色、フォント、座標を再利用しない。

## Phase 6: Content QA

- 数値を原典と照合
- タイトルと本文の整合
- Fact / hypothesisの区別
- 単位・期間の統一
- 付録への参照

## Phase 7: Visual QA

- 全ページを画像化
- contact sheetでリズム確認
- 高密度ページを原寸確認
- 重なり、切れ、改行を修正
- 代表ページをGoogle Slidesで再確認
- native PPTXで要素が編集可能か確認
- SVG snapshotとnative PPTXの差分を確認

## Phase 8: Executive edit

次の順で削る。

1. 重複
2. 前置き
3. 形容詞
4. 例示
5. 詳細前提

最後に、意思決定へ不要なページを付録へ移す。

## Phase 9: Release

確認項目:

- ファイル名と版
- 日付
- 機密区分
- 出典
- ページ番号
- 編集可能性
- PowerPoint / Google Slides / PDF
- speaker notes
- animation / narration settings

## Change log

大きな改訂では次を記録する。

- 変更日
- 変更理由
- 変更した論理
- 追加・削除したページ
- 数値更新
- 未解決事項

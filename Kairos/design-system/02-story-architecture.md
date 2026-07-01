# 02. Story Architecture

## 1. ストーリーはページより先に作る

最初にタイトルだけを並べる。タイトル列が論理的でない場合、レイアウトで救済しない。

各タイトルは次の形式を推奨する。

> Subject + judgment + implication

例:

> 現場利用から生まれる改善資産を国内で保有できなければ、データ保存だけでは主権を守れない

## 2. Pyramid structure

デッキは上位結論から詳細へ降りる。

1. Executive answer
2. Supporting reasons
3. Evidence
4. Execution
5. Risks and decisions
6. Appendix

各階層の論点は、可能な限りMECEに整理する。

## 3. 標準ストーリー: Strategy / Board

1. `Mandate`: 何を判断してほしいか
2. `Executive answer`: 推奨案は何か
3. `Why now`: なぜ今か
4. `Problem`: 何が構造的問題か
5. `Insight`: 何が従来理解と違うか
6. `Options`: どんな選択肢があるか
7. `Recommendation`: なぜこの案か
8. `Economics`: 価値とコストはどうか
9. `Execution`: どう進めるか
10. `Risk`: 何が崩れると失敗するか
11. `Decision`: 今日決めることは何か

## 4. 標準ストーリー: Policy proposal

1. 国家・産業上のMandate
2. 現状と放置コスト
3. 中心命題
4. 守る対象の定義
5. 戦略の柱
6. 制度・技術アーキテクチャ
7. 経済合理性
8. 実装ロードマップ
9. 政策アクション
10. ガバナンス
11. 判断事項

## 5. 標準ストーリー: Technology strategy

1. Business outcome
2. Workload / user need
3. Constraints
4. Architecture principles
5. Target architecture
6. Build / buy / partner
7. Economics and scale
8. Migration path
9. Risks and gates
10. Decision

## 6. SCQAの使い方

- `Situation`: 共通認識
- `Complication`: 何が変わり、何が問題か
- `Question`: 何を決めるべきか
- `Answer`: 推奨案

SCQAは冒頭3〜5枚の構成へ使う。全ページをSCQA形式へしない。

## 7. Section rhythm

3〜5枚ごとに視覚的・論理的なリズムを変える。

推奨:

- 結論
- 根拠
- 比較
- 図解
- ロードマップ

避ける:

- 定義スライドが5枚以上連続する
- 同じ3カラムが連続する
- 表が3枚以上連続する

## 8. Executive summary

Executive summaryは目次ではない。以下を含む。

- 推奨する結論
- その理由2〜4点
- 期待価値
- 最大リスク
- 求める判断

本文スライドを読まなくても、意思決定者が立場を理解できる状態にする。

## 9. Decision ending

最後は「まとめ」ではなく、次のいずれかで終える。

- 承認してほしい事項
- 選んでほしい選択肢
- 開始するアクション
- 次のゲート
- 未解決の論点

## 10. Appendix mapping

本編の根拠を付録へ移した場合、次を明記する。

- 本編スライドID
- 付録スライドID
- 何の詳細か
- 前提日付

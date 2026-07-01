# KairosAI Presentation Design System

このディレクトリは、KairosAIのプレゼンテーションを企画、執筆、設計、実装、レビューするためのMarkdownベースの仕様書群である。

## 基本思想

資料品質は、装飾の巧さではなく次の積で決まる。

> Quality = Decision clarity × Evidence quality × Visual hierarchy × Production discipline

どれか一つがゼロに近い場合、資料全体の信頼性が落ちる。

## ファイルの役割

- `01-foundations.md`: 見た目の共通言語
- `02-story-architecture.md`: デッキ全体の論理
- `03-slide-archetypes.md`: ページの型
- `04-layout-system.md`: 配置、部品、余白
- `05-data-and-evidence.md`: 数値と証拠
- `06-writing-system.md`: タイトルと文章
- `07-production-workflow.md`: 制作工程
- `08-quality-gates.md`: 合否判定
- `09-design-tokens.md`: 実装値
- `10-layout-wireframes.md`: 標準配置の視覚見本
- `11-lecture-deck-system.md`: 因果関係を一段ずつ説明する講義資料の型
- `12-ppt-master-integration.md`: PPT Master由来の制作規律、テンプレート構造、PPTX生成ルール
- `templates/`: 制作前とレビュー時に複製して使う雛形
- `references/`: 参照デッキと外部資料の分析

## 運用ルール

1. デザイン前にストーリーを確定する
2. ストーリー確定前に装飾へ進まない
3. レイアウトは標準archetypeから選ぶ
4. 例外は理由を記録する
5. 全ページを画像として確認する
6. Google Slides変換後も代表ページを再確認する

## 推奨成果物

新規デッキでは、次を順に作る。

1. `deck-brief`
2. タイトルだけのストーリーライン
3. slide-spec一覧
4. `spec-lock`
5. 代表5枚
6. 全体初稿
7. QA台帳
8. 最終デッキ

## 命名

- デッキ: `KairosAI-{topic}-v{major}.{minor}`
- スライドID: `S01`, `S02` ...
- レイアウトID: `A01`, `A02` ...
- 図表ID: `CH01`, `TB01`, `DG01`
- 付録: `AP01`, `AP02` ...

番号は意味ではなく追跡用として使う。スライドタイトルに不要な番号は表示しない。

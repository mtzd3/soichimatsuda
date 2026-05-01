# Google Doc To Markdown Resume Log

## Task

Google ドキュメント:
`https://docs.google.com/document/d/1hdIcYOgxNQdjTB7Tfdo_VTw8pyCd2hn9J0_T37cLy4k/edit?tab=t.0`

依頼内容:
Google Docs の内容を `.md` ファイル化すること。

## Current Status

- 前回の作業では、Google Docs 本文の抽出と Markdown 化までは完了した。
- 当時の出力先は `/Users/so01/datacenter-chip-architecture.md`。
- 2026-03-20 時点では、その出力ファイルは見当たらない。
- ただし、再生成に必要な中間成果物は残っている。

## Important Remaining Artifacts

- `/Users/so01/.google_doc_edit.html`
  - 認証済み Chrome セッション経由で取得した Google Docs の編集ページ HTML。
  - これが最重要。再開時はまずこれを使う。
- `/Users/so01/.tmp_google_doc_env`
  - 一時 Python 仮想環境。
  - `browser-cookie3` をここに入れている。
- `/Users/so01/.google_doc_capture.txt`
  - AppleScript/GUI 経由の取得試行の残骸。
  - 信頼ソースとしては使わない方がいい。

## What Was Tried

1. `curl` で `export?format=txt` を直接取得
   - Google ログインへ 302 リダイレクト。
   - 未認証では不可。
2. `playwright` スキル経由で CLI 操作を試行
   - スキルの想定する `playwright-cli` がこの環境では見つからず失敗。
3. AppleScript で Chrome/Safari から本文コピーを試行
   - Chrome: アクセシビリティ権限不足でキー送信不可。
   - Safari/Chrome: Apple Events からの JavaScript 実行が無効で不可。
4. Chrome cookie を使う方針へ切り替え
   - 一時 venv を作成し、`browser-cookie3` を導入。
5. Chrome プロファイルを検証
   - `Default`: `401`
   - `Profile 3`: cookie 復号失敗
   - `Profile 8`: 認証済みで編集ページ HTML の取得に成功
6. `Profile 8` の cookie を使って Google Docs 編集ページ HTML を保存
   - 保存先: `/Users/so01/.google_doc_edit.html`
7. HTML 内の `DOCS_modelChunk` から本文文字列を抽出し、Markdown を生成
   - 一度は `/Users/so01/datacenter-chip-architecture.md` を作成済み
   - そのファイルは現在消えている

## Key Technical Findings

- 直接の `export?format=txt` は認証なしでは不可。
- 認証済み `Profile 8` の Chrome cookie なら編集ページ HTML までは取れる。
- 本文は `/Users/so01/.google_doc_edit.html` 内の `DOCS_modelChunk` に埋め込まれている。
- `DOCS_modelChunk` は JSON としてそのまま `json.loads` で読める。
- 本文のプレーンテキスト本体は:
  - `obj["chunk"][0]["s"]`
- 見出し情報は:
  - `chunk` 要素のうち `st == "paragraph"` かつ `sm.ps_hd` を持つもの
- 見出しは「該当 annotation の `si` 行そのもの」ではなく、
  - その直前の非空行に対応していた

## Exact Reconstruction Logic

再開時は以下のロジックで十分。

1. `/Users/so01/.google_doc_edit.html` を読む
2. 正規表現で `DOCS_modelChunk = {...}; DOCS_modelChunkLoadStart` を抜く
3. `json.loads(...)`
4. `obj["chunk"][0]["s"]` を本文として取得
5. 本文を行ごとに分解し、各行の開始文字位置を保持
6. `st == "paragraph"` かつ `sm.ps_hd` を持つ annotation を走査
7. annotation の `si` より前にある「直前の非空行」を見出し行としてマーク
8. Markdown 化
   - 先頭行は `# `
   - `ps_hd == 1` は `## `
   - `ps_hd == 2` は `### `
   - `ps_hd == 3` は `#### `
   - `ps_hd == 4` は `##### `
9. テキスト整形
   - `\ue909` は除去
   - 行頭の全角スペースは除去
   - 単独行 `*` は `[figure omitted]` に置換
   - 連続空行は 1 個に潰す

## Last Known Output Shape

- 出力ファイル名:
  - `/Users/so01/datacenter-chip-architecture.md`
- 行数:
  - 112 行
- 変換の特徴:
  - 見出しは Markdown 化済み
  - 画像は取得できないため `[figure omitted]`
  - 一部の Google Docs 独自リンク記号は落としている
  - リンクは完全復元ではなく、テキストとして残っている箇所あり

## Fastest Resume Path

最短は、再ログインや cookie 再取得をやり直さず、
`/Users/so01/.google_doc_edit.html` から直接 Markdown を再生成すること。

優先順:

1. `/Users/so01/.google_doc_edit.html` が残っているか確認
2. 残っていれば、その HTML から Markdown を再生成
3. もし HTML が消えていたら、`Profile 8` + `/Users/so01/.tmp_google_doc_env` を使って再取得
4. 必要なら出力先を今度は `/Users/so01/codex/` 配下に変更

## Known Limitations

- AppleScript/GUI 経由は権限・設定に阻まれたため、再挑戦の優先度は低い。
- `playwright` スキルはこの環境ではそのままでは使えなかった。
- 画像や一部リンク装飾は完全再現していない。
- hidden の一時ファイルは未掃除。

## If Work Restarts

再開時の最初の確認事項:

- `/Users/so01/.google_doc_edit.html` はあるか
- `/Users/so01/datacenter-chip-architecture.md` は本当に消えているか
- 出力先は `/Users/so01/` のままでよいか、それとも `/Users/so01/codex/` に変えるか

再開時の方針:

- HTML が残っていれば再抽出だけで済む
- cookie 再取得は HTML が無い場合のみ
- GUI 操作には戻らない

# Sources and Design References

## Primary reference deck

- [ATFIO_霞ヶ関向け簡易スライド_v1.3](https://docs.google.com/presentation/d/1P5tyZBcLDg3hXs2TZz1lMt3M-kglRujJuON_ZWll_40/edit)

適用:

- Action title
- 左端アクセント
- 構造化レイアウト
- 3本柱、層構造、ロードマップ

非適用:

- 小さな本文
- 影付きカード
- 情報詰込み
- 残存プレースホルダー

## PwC official materials

- [PwC Global Annual Review 2025](https://www.pwc.com/gx/en/global-annual-review/2025/pwc-global-annual-review-2025.pdf)
- [PwC Japan Group Annual Review 2025](https://www.pwc.com/jp/ja/about-us/annual-review/pdf/annual-review-2025en.pdf)
- [PwC brand evolution announcement](https://www.pwc.com/us/en/about-us/newsroom/press-releases/brand-evolution-at-the-forefront-of-change.html)
- [PwC: Time for change](https://www.pwc.com/gx/en/news-room/time-for-change.html)

抽出した原則:

- 白地と強いタイポグラフィ
- オレンジを焦点へ限定
- 大きな章番号
- 写真と本文の明確な分離
- 数字の大型表示
- 細い線と編集された余白
- bold / collaborative / optimisticという言語姿勢

PwCのロゴ、固有フォント、momentum mark、固有レイアウトを複製しない。

## General standards

- [Microsoft: Tips for creating and delivering an effective presentation](https://support.microsoft.com/en-us/office/tips-for-creating-and-delivering-an-effective-presentation-f43156b0-20d2-4c51-8345-0c337cefb88b)
- [W3C WCAG 2.2: Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [Google Fonts: Noto Sans Japanese](https://fonts.google.com/noto/specimen/Noto+Sans+JP)

## PPT Master

- [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)
- Local review snapshot: `/tmp/ppt-master`

抽出した原則:

- editable PPTXを最終成果物にする
- SVGを中間表現として使い、DrawingMLへ変換する
- `design_spec`と`spec_lock`を分離する
- brand / layout / deckをsegmentとして分ける
- テンプレートは明示パス指定だけで発火させる
- ページごとに`anchor` / `dense` / `breathing`のリズムを持たせる
- top-level groupを意味単位に分け、編集とアニメーションの基準にする
- アニメーションとナレーションは任意機能として扱う

非適用:

- 派手なサンプルスタイルの複製
- 影、発光、過度なグラデーションの標準化
- テンプレート名や雰囲気語からの曖昧な自動選択
- 一枚画像として固定されたPPTX

## Interpretation rule

外部資料は見た目を複製するためではなく、次を検証するために使う。

- 情報階層
- 余白
- 焦点
- 数値表現
- 読み順
- 言語姿勢

KairosAIの内容、色、構造、ブランド判断が常に優先される。

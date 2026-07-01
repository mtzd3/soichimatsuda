# 09. Design Tokens

このファイルは機械実装と目視確認の共通値を定義する。

```yaml
system:
  name: "KairosAI Executive Presentation System"
  version: "1.1"
  reference_systems:
    - "PPT Master integration"

slide:
  aspect_ratio: "16:9"
  width_px: 1280
  height_px: 720
  margin_px:
    left: 56
    right: 56
    top: 36
    bottom: 36
  grid:
    columns: 12
    gutter_px: 24
    base_unit_px: 8

zones:
  header_percent: 20
  evidence_percent: 72
  footer_percent: 8

typography:
  family_primary: "Noto Sans JP"
  family_fallback: "Arial"
  cover_pt: 56
  section_pt: 44
  action_title_pt: 36
  statement_pt: 44
  panel_title_pt: 22
  body_pt: 19
  body_min_pt: 17
  table_pt: 16
  table_min_pt: 14
  source_pt: 11
  page_number_pt: 10
  svg_px:
    cover: 75
    section: 59
    action_title: 48
    statement: 59
    panel_title: 29
    body: 25
    body_min: 23
    table: 21
    table_min: 19
    source: 15
    page_number: 13

color:
  canvas: "#FAF9F7"
  surface: "#FFFFFF"
  ink: "#20242A"
  text: "#4A5563"
  muted: "#77808C"
  line: "#D9D4CE"
  soft_fill: "#F1EFEC"
  accent: "#E45B1B"
  accent_dark: "#A83E17"
  navy: "#315F7D"
  sage: "#637A68"
  plum: "#7B6C79"
  gold: "#C99A2E"
  risk: "#A43E3E"

line:
  border_px: 1
  keyline_px: 6
  title_bar_px: 8
  title_rule_px: 1

radius:
  default_px: 0
  optional_px: 4

density:
  max_panels_standard: 3
  max_panels_absolute: 4
  max_bullets: 5
  max_process_steps: 7
  max_roadmap_phases: 4
  max_metrics: 4
  max_table_rows_main: 6
  max_table_columns_main: 5

rhythm:
  allowed:
    - "anchor"
    - "dense"
    - "breathing"
  max_dense_run: 2
  max_same_archetype_run: 3
  breathing_interval_recommendation: "every 3-5 dense or analytical slides"

footer:
  source_alignment: "left"
  classification_alignment: "center"
  page_number_alignment: "right"

behavior:
  shadows: false
  gradients: "cover_only"
  three_d_charts: false
  automatic_text_shrink: false
  native_editable_pptx: true
  spec_lock_required: true
  template_trigger: "explicit_directory_path_only"

export:
  primary: "native_pptx"
  secondary:
    - "pdf"
    - "google_slides_check"
  svg_snapshot: "optional_visual_reference"
  element_animation: "off_by_default"
  page_transition: "fade_or_none"
  narration: "optional"
```

## Semantic color mapping

```yaml
semantic:
  decision: "accent"
  evidence_primary: "navy"
  operations: "sage"
  governance: "plum"
  economics: "gold"
  risk: "risk"
  neutral: "ink"
```

## Template segments

```yaml
template_segments:
  brand:
    owns:
      - color
      - typography
      - logo
      - voice
      - icon_style
  layout:
    owns:
      - canvas
      - grid
      - page_structure
      - archetype_roster
      - wireframes
  deck:
    owns:
      - brand
      - layout
      - narrative_rhythm
  precedence:
    - user_override
    - brand_segment
    - layout_segment
    - deck_segment
    - kairos_default
```

## Implementation constraints

- tokenにない色を追加する場合は理由を記録する
- フォントサイズを個別調整して収めない
- 同一archetypeの座標は再利用する
- 位置と寸法は原則8px単位
- 自動縮小を無効化する
- SVG経由では`svg_px`を使い、PPT上の見た目はpt換算で確認する
- `spec-lock`なしに長いデッキを生成しない
- 画像一枚貼りのPPTXを最終成果物にしない

# Spec Lock

このファイルは、生成とレビューで使う固定値である。迷ったら`design_spec`ではなく、このファイルの値を優先する。

## Metadata

- Deck:
- Version:
- Date:
- Owner:
- Source design system: KairosAI Executive Presentation System
- Template route: free / brand / layout / deck / PPTX preserve

## Canvas

- Format: 16:9
- Size: 1280 x 720
- ViewBox: 0 0 1280 720
- Margin: left 56 / right 56 / top 36 / bottom 36
- Grid: 12 columns / 24 gutter / 8 base unit

## Typography

- Primary:
- Fallback:
- Mono:

| Role | Size | Weight | Notes |
| --- | ---: | --- | --- |
| Cover title | 75 px | Bold | 56 pt equivalent |
| Section title | 59 px | Bold | 44 pt equivalent |
| Action title | 48 px | Bold | 36 pt equivalent |
| Lead | 25 px | Regular | Body or larger |
| Body | 25 px | Regular | Do not shrink per slide |
| Table | 21 px | Regular | Minimum 19 px |
| Source | 15 px | Regular | Minimum readable |
| Page number | 13 px | Regular |  |

## Color

| Token | Hex | Role |
| --- | --- | --- |
| canvas | #FAF9F7 | Background |
| surface | #FFFFFF | Table / diagram surface |
| ink | #20242A | Title / strong text |
| text | #4A5563 | Body |
| muted | #77808C | Support |
| line | #D9D4CE | Rules |
| soft-fill | #F1EFEC | Soft area |
| accent | #E45B1B | Decision / focus |
| accent-dark | #A83E17 | Strong accent |
| navy | #315F7D | AI / data / publicness |
| sage | #637A68 | Operations |
| plum | #7B6C79 | Governance |
| gold | #C99A2E | Economics |
| risk | #A43E3E | Risk |

## Layout

- Footer: source left / classification center / page number right
- Shadows: false
- Gradients: cover only
- Rounded corners: 0 default / 4 px optional
- So-what band: maximum one per page

## Page Roster

| Slide | Role | Archetype | Rhythm | Layout source | Primary evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S01 |  |  | anchor |  |  |  |

## Assets

| ID | Type | Path | Usage | Source / license |
| --- | --- | --- | --- | --- |
|  | logo / image / icon / chart |  |  |  |

## Export

- Primary: native PPTX
- Secondary: PDF
- Google Slides check: yes / no
- SVG snapshot: yes / no
- Page transition: none / fade
- Element animation: off / auto / custom
- Narration: none / speaker notes / audio

## Acceptance

- [ ] All pages use locked color tokens
- [ ] All pages use locked typography roles
- [ ] Every slide has a rhythm
- [ ] Dense slides do not run longer than allowed
- [ ] Native PPTX elements remain editable
- [ ] Sources and notes are preserved

import fs from "node:fs";
import { execFileSync } from "node:child_process";

const presentationId = "1CzayalEY9NVHKxRmBol9MeheOZdJv0IO3sFR8P7mcvs";
const expectedTitle = "KairosAI Core Thesis — Usage, Data & Sovereignty v0.3";
const model = JSON.parse(
  fs.readFileSync("/tmp/kairos-lecture/lecture-model.json", "utf8"),
).slides;

const EMU = 9525;
const PT = 12700;
const C = {
  canvas: "#FAF9F7",
  white: "#FFFFFF",
  ink: "#20242A",
  text: "#4A5563",
  muted: "#77808C",
  navy: "#173B6C",
  blue: "#315F7D",
  paleBlue: "#E6F1F6",
  accent: "#E45B1B",
  paleAccent: "#FBEDE6",
  risk: "#A43E3E",
  paleRisk: "#F7EAEA",
  sage: "#637A68",
  paleSage: "#EFF3EF",
  gold: "#C99A2E",
  paleGold: "#F7F0DF",
  line: "#D9D4CE",
  pale: "#F1EFEC",
};

function rgb(hex) {
  const value = hex.replace("#", "");
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function pageId(n) {
  if (n <= 57) return n === 8 ? "p8" : `v03_slide_${String(n).padStart(2, "0")}`;
  return `lecture_slide_${String(n).padStart(3, "0")}`;
}

function oid(n, kind, i = 0) {
  return `lec_${String(n).padStart(3, "0")}_${kind}_${String(i).padStart(2, "0")}`;
}

function chapter(n) {
  if (n <= 4) return ["EXECUTIVE THESIS", C.accent];
  if (n <= 18) return ["01｜利用から始める", C.accent];
  if (n <= 44) return ["02｜能力としての主権", C.blue];
  if (n <= 52) return ["03｜三本柱の共同生産", C.sage];
  if (n <= 69) return ["04｜計算・供給の経済性", C.gold];
  if (n <= 86) return ["05｜実装・検証・分岐", C.risk];
  return ["APPENDIX｜定義・検証表", C.gold];
}

function rect(req, slideNo, id, x, y, w, h, {
  fill = C.white,
  radius = false,
  outline = null,
  align = "TOP",
} = {}) {
  req.push({
    createShape: {
      objectId: id,
      shapeType: radius ? "ROUND_RECTANGLE" : "RECTANGLE",
      elementProperties: {
        pageObjectId: pageId(slideNo),
        size: {
          width: { magnitude: w * EMU, unit: "EMU" },
          height: { magnitude: h * EMU, unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: x * EMU,
          translateY: y * EMU,
          unit: "EMU",
        },
      },
    },
  });
  const props = {
    shapeBackgroundFill:
      fill === "none"
        ? { propertyState: "NOT_RENDERED" }
        : { solidFill: { color: { rgbColor: rgb(fill) }, alpha: 1 } },
    outline: outline
      ? {
          outlineFill: { solidFill: { color: { rgbColor: rgb(outline) }, alpha: 1 } },
          weight: { magnitude: 0.75, unit: "PT" },
        }
      : { propertyState: "NOT_RENDERED" },
    contentAlignment: align,
  };
  req.push({
    updateShapeProperties: {
      objectId: id,
      shapeProperties: props,
      fields: outline
        ? "shapeBackgroundFill,outline.outlineFill,outline.weight,contentAlignment"
        : "shapeBackgroundFill,outline.propertyState,contentAlignment",
    },
  });
}

function text(req, slideNo, id, value, x, y, w, h, {
  size = 18,
  color = C.ink,
  bold = false,
  align = "START",
  valign = "TOP",
  fill = "none",
  outline = null,
  radius = false,
  font = "Noto Sans JP",
  lineSpacing = 105,
} = {}) {
  rect(req, slideNo, id, x, y, w, h, {
    fill,
    outline,
    radius,
    align: valign,
  });
  req.push({ insertText: { objectId: id, insertionIndex: 0, text: String(value) } });
  req.push({
    updateTextStyle: {
      objectId: id,
      textRange: { type: "ALL" },
      style: {
        fontFamily: font,
        fontSize: { magnitude: size, unit: "PT" },
        bold,
        foregroundColor: { opaqueColor: { rgbColor: rgb(color) } },
      },
      fields: "fontFamily,fontSize,bold,foregroundColor",
    },
  });
  req.push({
    updateParagraphStyle: {
      objectId: id,
      textRange: { type: "ALL" },
      style: { alignment: align, lineSpacing },
      fields: "alignment,lineSpacing",
    },
  });
}

function bg(req, slideNo, color = C.canvas) {
  req.push({
    updatePageProperties: {
      objectId: pageId(slideNo),
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: rgb(color) }, alpha: 1 },
        },
      },
      fields: "pageBackgroundFill",
    },
  });
}

function titleSize(title) {
  const len = title.replace(/\n/g, "").length;
  if (len > 44) return 20;
  if (len > 36) return 22;
  if (len > 30) return 24;
  return 28;
}

function normalFrame(req, s) {
  const [label, accent] = chapter(s.number);
  text(req, s.number, oid(s.number, "chap"), label, 48, 24, 420, 22, {
    size: 11,
    color: accent,
    bold: true,
    valign: "MIDDLE",
  });
  text(req, s.number, oid(s.number, "title"), s.title, 48, 51, 1115, 66, {
    size: titleSize(s.title),
    color: C.ink,
    bold: true,
    valign: "MIDDLE",
    lineSpacing: 95,
  });
  rect(req, s.number, oid(s.number, "rule"), 48, 122, 1184, 2, { fill: accent });
  if (s.tag) tag(req, s.number, s.tag, accent, 1074, 22);
  rect(req, s.number, oid(s.number, "footrule"), 48, 672, 1184, 1, { fill: C.line });
  const source = s.source || "KairosAI Core Thesis v0.2";
  text(req, s.number, oid(s.number, "source"), source, 48, 680, 1040, 20, {
    size: 8.5,
    color: C.muted,
    valign: "MIDDLE",
  });
  text(req, s.number, oid(s.number, "page"), String(s.number).padStart(3, "0"), 1160, 680, 72, 20, {
    size: 9,
    color: C.muted,
    align: "END",
    valign: "MIDDLE",
  });
  return accent;
}

function tag(req, n, value, color, x = 1080, y = 26) {
  text(req, n, oid(n, "tag"), value, x, y, 150, 25, {
    size: 10,
    color: C.white,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: color,
    radius: true,
  });
}

function labelBox(req, n, index, label, x, y, w, color) {
  text(req, n, oid(n, "label", index), label, x, y, w, 28, {
    size: 11,
    color: C.white,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: color,
  });
}

function implication(req, s, value, color = C.accent, y = 596) {
  rect(req, s.number, oid(s.number, "impline"), 48, y, 8, 54, { fill: color });
  text(req, s.number, oid(s.number, "imp"), `示唆｜${value}`, 68, y, 1164, 54, {
    size: 16,
    color: C.ink,
    bold: true,
    valign: "MIDDLE",
    fill: C.pale,
  });
}

function renderCover(req, s) {
  bg(req, s.number, C.navy);
  rect(req, s.number, oid(s.number, "stripe"), 0, 0, 14, 720, { fill: C.accent });
  text(req, s.number, oid(s.number, "eyebrow"), "KAIROSAI CORE THESIS", 72, 66, 420, 28, {
    size: 12,
    color: "#BDD0E5",
    bold: true,
    valign: "MIDDLE",
  });
  text(req, s.number, oid(s.number, "cover"), s.title, 72, 142, 1030, 190, {
    size: 42,
    color: C.white,
    bold: true,
    valign: "MIDDLE",
    lineSpacing: 90,
  });
  rect(req, s.number, oid(s.number, "accent"), 72, 366, 120, 5, { fill: C.accent });
  text(req, s.number, oid(s.number, "subtitle"), s.subtitle, 72, 400, 1030, 70, {
    size: 22,
    color: "#DDE7F2",
    bold: false,
    valign: "MIDDLE",
  });
  text(req, s.number, oid(s.number, "meta"), s.meta, 72, 625, 900, 28, {
    size: 11,
    color: "#BDD0E5",
    valign: "MIDDLE",
  });
}

function renderGuide(req, s) {
  bg(req, s.number);
  normalFrame(req, s);
  const y0 = 155;
  s.items.forEach(([a, b], i) => {
    const y = y0 + i * 83;
    text(req, s.number, oid(s.number, "gnum", i), a, 62, y, 190, 58, {
      size: 16,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === 0 ? C.accent : C.navy,
    });
    text(req, s.number, oid(s.number, "gdesc", i), b, 272, y, 900, 58, {
      size: 18,
      color: C.ink,
      bold: true,
      valign: "MIDDLE",
      fill: i % 2 ? C.white : C.paleBlue,
    });
  });
  text(req, s.number, oid(s.number, "gfoot"), s.footer, 62, 586, 1110, 52, {
    size: 13,
    color: C.text,
    valign: "MIDDLE",
    fill: C.pale,
  });
}

function renderStatement(req, s) {
  bg(req, s.number);
  normalFrame(req, s);
  text(req, s.number, oid(s.number, "statement"), s.statement, 90, 170, 1100, 200, {
    size: 34,
    color: C.navy,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: C.paleBlue,
    lineSpacing: 95,
  });
  rect(req, s.number, oid(s.number, "sline"), 190, 404, 900, 3, { fill: C.accent });
  text(req, s.number, oid(s.number, "body"), s.body || "", 150, 438, 980, 126, {
    size: 18,
    color: C.text,
    align: "CENTER",
    valign: "MIDDLE",
    lineSpacing: 120,
  });
}

function renderSection(req, s) {
  bg(req, s.number, C.navy);
  const longSection = String(s.section).length > 3;
  text(req, s.number, oid(s.number, "sec"), s.section, 68, 72, longSection ? 520 : 180, 150, {
    size: longSection ? 42 : 84,
    color: C.accent,
    bold: true,
    valign: "MIDDLE",
  });
  rect(req, s.number, oid(s.number, "secrule"), 68, 250, 1120, 4, { fill: C.accent });
  text(req, s.number, oid(s.number, "sectitle"), s.title, 68, 292, 1080, 110, {
    size: 38,
    color: C.white,
    bold: true,
    valign: "MIDDLE",
  });
  text(req, s.number, oid(s.number, "question"), `問い｜${s.question || ""}`, 68, 450, 1080, 95, {
    size: 20,
    color: "#DDE7F2",
    valign: "MIDDLE",
    lineSpacing: 115,
  });
  text(req, s.number, oid(s.number, "secpage"), String(s.number).padStart(3, "0"), 1100, 650, 88, 25, {
    size: 10,
    color: "#BDD0E5",
    align: "END",
    valign: "MIDDLE",
  });
}

function renderChain(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  if (s.lead) {
    text(req, s.number, oid(s.number, "lead"), s.lead, 60, 144, 1150, 44, {
      size: 15,
      color: C.text,
      valign: "MIDDLE",
      fill: C.pale,
    });
  }
  const nodes = s.nodes;
  const gap = nodes.length >= 5 ? 22 : 34;
  const total = 1160;
  const w = (total - gap * (nodes.length - 1)) / nodes.length;
  const y = 230;
  nodes.forEach(([head, body], i) => {
    const x = 60 + i * (w + gap);
    text(req, s.number, oid(s.number, "step", i), String(i + 1).padStart(2, "0"), x, y - 34, 48, 25, {
      size: 10,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === 0 ? C.accent : accent,
    });
    text(req, s.number, oid(s.number, "node", i), head, x, y, w, 74, {
      size: nodes.length >= 5 ? 18 : 21,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === nodes.length - 1 ? C.accent : C.navy,
    });
    text(req, s.number, oid(s.number, "nodebody", i), body, x, y + 78, w, 105, {
      size: nodes.length >= 5 ? 14 : 16,
      color: C.ink,
      align: "CENTER",
      valign: "MIDDLE",
      fill: C.white,
      outline: C.line,
      lineSpacing: 110,
    });
    if (i < nodes.length - 1) {
      text(req, s.number, oid(s.number, "arrow", i), "→", x + w, y + 70, gap, 40, {
        size: 23,
        color: C.accent,
        bold: true,
        align: "CENTER",
        valign: "MIDDLE",
      });
    }
  });
  if (s.implication) implication(req, s, s.implication, accent);
}

function renderExplain(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  if (s.lead) {
    text(req, s.number, oid(s.number, "lead"), s.lead, 60, 144, 1150, 42, {
      size: 15,
      color: C.text,
      valign: "MIDDLE",
      fill: C.pale,
    });
  }
  const cols = [
    ["① 原因・前提", s.cause || [], C.blue, C.paleBlue],
    ["② 仕組み・媒介", s.mechanism || [], C.navy, C.white],
    ["③ 帰結", s.result || [], C.accent, C.paleAccent],
  ];
  const xs = [60, 446, 832];
  cols.forEach(([lab, items, color, fill], i) => {
    labelBox(req, s.number, i, lab, xs[i], 206, 328, color);
    const body = items.map((v) => `• ${v}`).join("\n");
    text(req, s.number, oid(s.number, "col", i), body, xs[i], 240, 328, 304, {
      size: items.length >= 5 ? 15 : 17,
      color: C.ink,
      bold: false,
      valign: "TOP",
      fill,
      outline: C.line,
      lineSpacing: items.length >= 5 ? 125 : 145,
    });
    if (i < 2) {
      text(req, s.number, oid(s.number, "arrow", i), "→", xs[i] + 330, 358, 54, 42, {
        size: 25,
        color: C.accent,
        bold: true,
        align: "CENTER",
        valign: "MIDDLE",
      });
    }
  });
  implication(req, s, s.implication || "設計・判断条件へ反映する。", accent);
}

function renderList(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  if (s.lead) {
    text(req, s.number, oid(s.number, "lead"), s.lead, 60, 144, 1150, 44, {
      size: 15,
      color: C.text,
      valign: "MIDDLE",
      fill: C.pale,
    });
  }
  const items = s.items || [];
  const startY = s.lead ? 205 : 160;
  const available = 575 - startY;
  const rowH = Math.min(78, Math.max(54, available / items.length - 6));
  items.forEach((item, i) => {
    const [head, body = ""] = Array.isArray(item) ? item : [String(i + 1), item];
    const y = startY + i * (rowH + 6);
    text(req, s.number, oid(s.number, "num", i), String(i + 1).padStart(2, "0"), 62, y, 64, rowH, {
      size: 13,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === 0 ? C.accent : accent,
    });
    text(req, s.number, oid(s.number, "head", i), head, 134, y, 310, rowH, {
      size: rowH < 62 ? 15 : 17,
      color: C.ink,
      bold: true,
      valign: "MIDDLE",
      fill: i % 2 ? C.white : C.paleBlue,
    });
    text(req, s.number, oid(s.number, "body", i), body, 448, y, 724, rowH, {
      size: rowH < 62 ? 13 : 15,
      color: C.text,
      valign: "MIDDLE",
      fill: i % 2 ? C.white : C.paleBlue,
    });
  });
}

function renderCompare(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  const sides = [
    [s.left, 60, C.blue, C.paleBlue],
    [s.right, 654, C.accent, C.paleAccent],
  ];
  sides.forEach(([side, x, color, fill], i) => {
    text(req, s.number, oid(s.number, "clabel", i), side.label, x, 164, 566, 64, {
      size: 20,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: color,
    });
    const body = side.points.map((v) => `• ${v}`).join("\n");
    text(req, s.number, oid(s.number, "cbody", i), body, x, 235, 566, 294, {
      size: side.points.length > 4 ? 15 : 18,
      color: C.ink,
      valign: "TOP",
      fill,
      outline: C.line,
      lineSpacing: side.points.length > 4 ? 135 : 155,
    });
  });
  text(req, s.number, oid(s.number, "plus"), "×", 610, 314, 34, 44, {
    size: 26,
    color: C.navy,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
  });
  implication(
    req,
    s,
    s.implication || "確認済み事実と未確認事項を分け、同じ基準で比較する。",
    accent,
    565,
  );
}

function renderMatrix(req, s) {
  bg(req, s.number);
  normalFrame(req, s);
  if (s.lead) {
    text(req, s.number, oid(s.number, "lead"), s.lead, 60, 142, 1150, 40, {
      size: 14,
      color: C.text,
      valign: "MIDDLE",
      fill: C.pale,
    });
  }
  const x0 = 55, y0 = 198, totalW = 1170;
  const cols = s.columns.length;
  const firstW = 180;
  const cellW = (totalW - firstW) / (cols - 1);
  const widths = [firstW, ...Array(cols - 1).fill(cellW)];
  const rowH = 70;
  let x = x0;
  s.columns.forEach((v, i) => {
    text(req, s.number, oid(s.number, "mh", i), v, x + 1, y0, widths[i] - 2, 48, {
      size: i === 0 ? 13 : 11,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: C.navy,
    });
    x += widths[i];
  });
  s.rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((v, i) => {
      text(req, s.number, oid(s.number, `mr${r}`, i), v, cx + 1, y0 + 50 + r * rowH, widths[i] - 2, rowH - 2, {
        size: i === 0 ? 12 : 10.5,
        color: i === 0 ? C.ink : C.text,
        bold: i === 0,
        align: "CENTER",
        valign: "MIDDLE",
        fill: r % 2 ? C.white : C.paleBlue,
      });
      cx += widths[i];
    });
  });
}

function renderFormula(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  const terms = s.terms || [];
  const gap = 40;
  const w = (1040 - gap * (terms.length - 1)) / terms.length;
  terms.forEach(([head, body], i) => {
    const x = 80 + i * (w + gap);
    text(req, s.number, oid(s.number, "fterm", i), head, x, 188, w, 86, {
      size: 19,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === terms.length - 1 ? C.accent : C.navy,
    });
    text(req, s.number, oid(s.number, "fbody", i), body, x, 280, w, 72, {
      size: 14,
      color: C.text,
      align: "CENTER",
      valign: "MIDDLE",
      fill: C.white,
      outline: C.line,
    });
    if (i < terms.length - 1) {
      text(req, s.number, oid(s.number, "fmul", i), "×", x + w, 212, gap, 42, {
        size: 23,
        color: C.accent,
        bold: true,
        align: "CENTER",
        valign: "MIDDLE",
      });
    }
  });
  if (s.additions?.length) {
    text(req, s.number, oid(s.number, "fplus"), "＋", 105, 395, 60, 48, {
      size: 25,
      color: C.accent,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
    });
    const addW = 260;
    s.additions.forEach((v, i) => {
      text(req, s.number, oid(s.number, "fadd", i), v, 190 + i * 300, 392, addW, 58, {
        size: 16,
        color: C.ink,
        bold: true,
        align: "CENTER",
        valign: "MIDDLE",
        fill: C.pale,
      });
    });
  }
  implication(req, s, s.implication, accent, 550);
}

function renderBranch(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  text(req, s.number, oid(s.number, "trunk"), s.trunk.map((v, i) => `${i + 1}. ${v}`).join("　→　"), 100, 158, 1080, 68, {
    size: 17,
    color: C.white,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: C.navy,
  });
  const sides = [
    [s.left, 80, C.sage, C.paleSage],
    [s.right, 660, C.gold, C.paleGold],
  ];
  sides.forEach(([side, x, color, fill], i) => {
    text(req, s.number, oid(s.number, "blabel", i), side.label, x, 276, 540, 58, {
      size: 19,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: color,
    });
    text(req, s.number, oid(s.number, "bbody", i), side.points.map((v) => `• ${v}`).join("\n"), x, 340, 540, 196, {
      size: 17,
      color: C.ink,
      valign: "TOP",
      fill,
      outline: C.line,
      lineSpacing: 145,
    });
  });
  text(req, s.number, oid(s.number, "fork"), "需要・能力GATE", 520, 232, 240, 38, {
    size: 12,
    color: C.white,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: C.accent,
  });
  implication(req, s, s.implication, accent, 570);
}

function renderPhase(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  text(req, s.number, oid(s.number, "phase"), s.phase, 62, 158, 220, 72, {
    size: 25,
    color: C.white,
    bold: true,
    align: "CENTER",
    valign: "MIDDLE",
    fill: accent,
  });
  text(req, s.number, oid(s.number, "focus"), s.focus, 296, 158, 876, 72, {
    size: 24,
    color: C.navy,
    bold: true,
    valign: "MIDDLE",
    fill: C.paleBlue,
  });
  s.actions.forEach((v, i) => {
    const y = 270 + i * 78;
    text(req, s.number, oid(s.number, "pnum", i), String(i + 1), 90, y, 52, 56, {
      size: 15,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: accent,
    });
    text(req, s.number, oid(s.number, "pact", i), v, 154, y, 1018, 56, {
      size: 17,
      color: C.ink,
      valign: "MIDDLE",
      fill: i % 2 ? C.white : C.pale,
    });
  });
  implication(req, s, `EXIT｜${s.exit}`, accent, 545);
}

function renderLogic(req, s) {
  bg(req, s.number);
  const accent = normalFrame(req, s);
  const gap = 20;
  const w = (1160 - gap * 4) / 5;
  s.stages.forEach(([head, body], i) => {
    const x = 60 + i * (w + gap);
    text(req, s.number, oid(s.number, "lhead", i), head, x, 185, w, 50, {
      size: 13,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i === 4 ? C.accent : C.navy,
    });
    text(req, s.number, oid(s.number, "lbody", i), body, x, 241, w, 205, {
      size: 15,
      color: C.ink,
      align: "CENTER",
      valign: "MIDDLE",
      fill: i % 2 ? C.white : C.paleBlue,
      outline: C.line,
    });
    if (i < 4) {
      text(req, s.number, oid(s.number, "larrow", i), "→", x + w, 320, gap, 35, {
        size: 18,
        color: C.accent,
        bold: true,
        align: "CENTER",
        valign: "MIDDLE",
      });
    }
  });
  implication(req, s, s.footer, accent, 510);
}

function renderTable(req, s) {
  bg(req, s.number);
  normalFrame(req, s);
  const headers = s.headers || [];
  const rows = s.rows || [];
  const x0 = 55, y0 = 158, totalW = 1170;
  const cols = headers.length;
  let widths;
  if (cols === 2) widths = [360, 810];
  else if (cols === 3) widths = [360, 330, 480];
  else if (cols === 4) widths = [250, 300, 300, 320];
  else widths = Array(cols).fill(totalW / cols);
  const headerH = 48;
  const rowH = Math.min(70, Math.max(44, (490 - headerH) / rows.length));
  let x = x0;
  headers.forEach((v, i) => {
    text(req, s.number, oid(s.number, "th", i), v, x + 1, y0, widths[i] - 2, headerH, {
      size: 13,
      color: C.white,
      bold: true,
      align: "CENTER",
      valign: "MIDDLE",
      fill: C.navy,
    });
    x += widths[i];
  });
  rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((v, i) => {
      text(req, s.number, oid(s.number, `tr${r}`, i), v, cx + 1, y0 + headerH + r * rowH, widths[i] - 2, rowH - 2, {
        size: rows.length > 8 ? 10.5 : rows.length > 6 ? 11.5 : 13,
        color: i === 0 ? C.ink : C.text,
        bold: i === 0,
        align: i === 0 ? "START" : "START",
        valign: "MIDDLE",
        fill: r % 2 ? C.white : C.paleBlue,
        lineSpacing: 105,
      });
      cx += widths[i];
    });
  });
}

function renderSources(req, s) {
  bg(req, s.number);
  normalFrame(req, s);
  labelBox(req, s.number, 0, "一次資料・原文", 60, 158, 550, C.navy);
  labelBox(req, s.number, 1, "補助資料・ベンチマーク", 670, 158, 550, C.gold);
  text(req, s.number, oid(s.number, "sleft"), s.left.map((v) => `• ${v}`).join("\n"), 60, 192, 550, 310, {
    size: 14,
    color: C.ink,
    valign: "TOP",
    fill: C.paleBlue,
    outline: C.line,
    lineSpacing: 135,
  });
  text(req, s.number, oid(s.number, "sright"), s.right.map((v) => `• ${v}`).join("\n"), 670, 192, 550, 310, {
    size: 14,
    color: C.ink,
    valign: "TOP",
    fill: C.paleGold,
    outline: C.line,
    lineSpacing: 135,
  });
  implication(req, s, s.context, C.gold, 530);
}

function renderSlide(s) {
  const req = [];
  switch (s.type) {
    case "cover": renderCover(req, s); break;
    case "guide": renderGuide(req, s); break;
    case "statement": renderStatement(req, s); break;
    case "section": renderSection(req, s); break;
    case "chain": renderChain(req, s); break;
    case "explain": renderExplain(req, s); break;
    case "list": renderList(req, s); break;
    case "compare": renderCompare(req, s); break;
    case "matrix": renderMatrix(req, s); break;
    case "formula": renderFormula(req, s); break;
    case "branch": renderBranch(req, s); break;
    case "phase": renderPhase(req, s); break;
    case "logic": renderLogic(req, s); break;
    case "table": renderTable(req, s); break;
    case "sources": renderSources(req, s); break;
    default: throw new Error(`Unknown type: ${s.type}`);
  }
  return req;
}

function gws(args) {
  try {
    const raw = execFileSync("gws", args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(raw);
  } catch (error) {
    console.error("STDERR:", error.stderr?.toString() || "(empty)");
    console.error("STDOUT:", error.stdout?.toString() || "(empty)");
    throw new Error("gws request failed");
  }
}

function metadata() {
  return gws([
    "slides", "presentations", "get",
    "--params",
    JSON.stringify({
      presentationId,
      fields: "presentationId,title,revisionId,slides(objectId,pageElements.objectId)",
    }),
    "--format", "json",
  ]);
}

function deployChunk(start, end) {
  const before = metadata();
  if (before.presentationId !== presentationId || before.title !== expectedTitle) {
    throw new Error(`Target guard failed: ${before.presentationId} / ${before.title}`);
  }
  const live = new Map(before.slides.map((slide) => [slide.objectId, slide]));
  const requests = [];
  for (let n = start; n <= end; n++) {
    const s = model[n - 1];
    const id = pageId(n);
    const current = live.get(id);
    if (!current) {
      requests.push({
        createSlide: {
          objectId: id,
          insertionIndex: n - 1,
          slideLayoutReference: { layoutId: "p65" },
        },
      });
    } else {
      for (const el of current.pageElements || []) {
        requests.push({ deleteObject: { objectId: el.objectId } });
      }
    }
    requests.push(...renderSlide(s));
  }
  const response = gws([
    "slides", "presentations", "batchUpdate",
    "--params", JSON.stringify({ presentationId }),
    "--json", JSON.stringify({
      requests,
      writeControl: { requiredRevisionId: before.revisionId },
    }),
    "--format", "json",
  ]);
  console.log(
    `deployed ${start}-${end}: ${requests.length} requests / revision ${
      response.writeControl?.requiredRevisionId || "unknown"
    }`,
  );
}

const start = Number(process.argv[2] || 1);
const end = Number(process.argv[3] || model.length);
const chunkSize = Number(process.argv[4] || 4);

for (let n = start; n <= end; n += chunkSize) {
  deployChunk(n, Math.min(end, n + chunkSize - 1));
}

const after = metadata();
console.log(JSON.stringify({
  title: after.title,
  revisionId: after.revisionId,
  slideCount: after.slides.length,
  first: after.slides.slice(0, 5).map((s) => s.objectId),
  last: after.slides.slice(-5).map((s) => s.objectId),
}, null, 2));

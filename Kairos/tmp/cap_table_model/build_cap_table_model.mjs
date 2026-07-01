import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/so01/codex/Kairos/outputs/cap_table_model_20260630";
const outputPath = `${outputDir}/kairos_cap_table_valuation_simulator.xlsx`;
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
await workbook.comments.setSelf({ displayName: "Codex" });

const theme = {
  navy: "#17324D",
  blue: "#2563EB",
  lightBlue: "#EAF2FF",
  paleYellow: "#FFF2CC",
  green: "#D9EAD3",
  red: "#F4CCCC",
  gray: "#F3F6F8",
  border: "#C7D0D9",
  text: "#111827",
  white: "#FFFFFF",
};

const fmt = {
  jpy: '#,##0;[Red](#,##0);-',
  shares: '#,##0;[Red](#,##0);-',
  pct: '0.0%;[Red](0.0%);-',
  pct2: '0.00%;[Red](0.00%);-',
  multiple: '0.0x;[Red](0.0x);-',
  price: '#,##0.0;[Red](#,##0.0);-',
};

function styleSheet(sheet) {
  sheet.showGridLines = false;
  sheet.getRange("A1:O120").format.font = { name: "Aptos", size: 10, color: theme.text };
}

function title(sheet, text, range = "A1:H1") {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill: theme.navy,
    font: { bold: true, color: theme.white, size: 14 },
  };
  r.format.rowHeightPx = 30;
}

function section(sheet, cell, text, width = 8) {
  const startCol = cell.match(/[A-Z]+/)[0];
  const row = Number(cell.match(/\d+/)[0]);
  const colIndex = colToNum(startCol);
  const endCol = numToCol(colIndex + width - 1);
  const r = sheet.getRange(`${startCol}${row}:${endCol}${row}`);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill: theme.navy,
    font: { bold: true, color: theme.white },
  };
}

function header(sheet, range) {
  const r = sheet.getRange(range);
  r.format = {
    fill: theme.gray,
    font: { bold: true, color: theme.text },
    borders: { preset: "outside", style: "thin", color: theme.border },
  };
}

function inputStyle(sheet, range) {
  const r = sheet.getRange(range);
  r.format = {
    fill: theme.paleYellow,
    font: { color: "#0000FF" },
    borders: { preset: "outside", style: "thin", color: theme.border },
  };
}

function formulaStyle(sheet, range) {
  const r = sheet.getRange(range);
  r.format = {
    font: { color: "#000000" },
    borders: { preset: "outside", style: "thin", color: theme.border },
  };
}

function totalStyle(sheet, range) {
  const r = sheet.getRange(range);
  r.format = {
    fill: theme.lightBlue,
    font: { bold: true, color: theme.text },
    borders: { preset: "outside", style: "thin", color: theme.border },
  };
}

function noteStyle(sheet, range) {
  const r = sheet.getRange(range);
  r.format = {
    fill: "#FAFAFA",
    font: { italic: true, color: "#374151" },
    borders: { preset: "outside", style: "thin", color: theme.border },
    wrapText: true,
  };
}

function setWidths(sheet, widths) {
  for (const [col, widthPx] of Object.entries(widths)) {
    sheet.getRange(`${col}1:${col}120`).format.columnWidthPx = widthPx;
  }
}

function colToNum(col) {
  let n = 0;
  for (const c of col) n = n * 26 + c.charCodeAt(0) - 64;
  return n;
}

function numToCol(num) {
  let col = "";
  while (num > 0) {
    const rem = (num - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    num = Math.floor((num - 1) / 26);
  }
  return col;
}

function addComment(sheet, cell, body) {
  workbook.comments.addThread({ cell: sheet.getRange(cell) }, body);
}

const summary = workbook.worksheets.add("Summary");
const inputs = workbook.worksheets.add("Inputs");
const cap = workbook.worksheets.add("Cap Table");
const val = workbook.worksheets.add("Valuation Sim");
const scenarios = workbook.worksheets.add("Scenarios");
const checks = workbook.worksheets.add("Checks");
const sources = workbook.worksheets.add("Sources");

for (const sheet of [summary, inputs, cap, val, scenarios, checks, sources]) {
  styleSheet(sheet);
}

// Inputs
title(inputs, "Kairos Capital Policy & Valuation Simulator - Inputs", "A1:F1");
inputs.freezePanes.freezeRows(3);
setWidths(inputs, { A: 360, B: 170, C: 100, D: 450, E: 110, F: 110 });

section(inputs, "A3", "Capital Policy Assumptions", 4);
inputs.getRange("A4:D13").values = [
  ["Input", "Value", "Units", "Notes"],
  ["Initial stated capital", 1000000, "JPY", "User-provided starting capital"],
  ["Founder initial shares", 1000000, "shares", "Illustrative share count; change freely"],
  ["Initial price per share", null, "JPY/share", "Calculated"],
  ["Founder IP/technology transfer value included in equity", 0, "JPY", "Default keeps IP transfer separate from equity issuance"],
  ["Seed investment amount", 100000000, "JPY", "User-provided planned financing"],
  ["Seed investor target ownership", 0.08, "%", "Default: approx. 8%"],
  ["SO pool target after Seed", 0.10, "%", "Default: 10% post-Seed pool"],
  ["Seed ownership basis", "After SO pool", "toggle", "After SO pool keeps investor at target after pool creation"],
  ["Capitalization ratio of new money", 0.50, "%", "Illustrative minimum capitalized portion if half goes to capital reserve"],
];
inputs.getRange("B7").formulas = [["=B5/B6"]];
header(inputs, "A4:D4");
inputStyle(inputs, "B5:B6");
inputStyle(inputs, "B8:B13");
formulaStyle(inputs, "B7");
inputs.getRange("B5:B5").format.numberFormat = fmt.jpy;
inputs.getRange("B6:B6").format.numberFormat = fmt.shares;
inputs.getRange("B7:B7").format.numberFormat = fmt.price;
inputs.getRange("B8:B9").format.numberFormat = fmt.jpy;
inputs.getRange("B10:B11").format.numberFormat = fmt.pct;
inputs.getRange("B13:B13").format.numberFormat = fmt.pct;
inputs.getRange("B12").dataValidation = { rule: { type: "list", values: ["After SO pool", "Before SO pool"] } };

section(inputs, "A15", "Future Round Assumptions", 4);
inputs.getRange("A16:D21").values = [
  ["Series A investment amount", 300000000, "JPY", "Illustrative future round"],
  ["Series A investor target ownership", 0.15, "%", "Post-round target"],
  ["SO pool target after Series A", 0.12, "%", "Total pool target after round"],
  ["Series B investment amount", 800000000, "JPY", "Illustrative future round"],
  ["Series B investor target ownership", 0.15, "%", "Post-round target"],
  ["SO pool target after Series B", 0.10, "%", "Total pool target after round"],
];
inputStyle(inputs, "B16:B21");
inputs.getRange("B16:B16").format.numberFormat = fmt.jpy;
inputs.getRange("B17:B18").format.numberFormat = fmt.pct;
inputs.getRange("B19:B19").format.numberFormat = fmt.jpy;
inputs.getRange("B20:B21").format.numberFormat = fmt.pct;

section(inputs, "A23", "Valuation Simulation Assumptions", 5);
inputs.getRange("A24:D28").values = [
  ["Net cash / (debt) used in equity value bridge", 100000000, "JPY", "Positive = net cash; negative = net debt"],
  ["Revenue multiple valuation weight", 0.50, "%", "Blended EV = weighted PSR EV + weighted profit-multiple EV"],
  ["Selected share count basis", "Post-Seed", "toggle", "Used for implied price per share"],
  ["Valuation basis", "Pre-money operating value", "memo", "1億円 ownership uses Investment / (Equity Value + Investment)"],
  ["Currency / unit", "JPY actual", "memo", "All monetary values are in JPY, not millions"],
];
inputStyle(inputs, "B24:B28");
inputs.getRange("B24").format.numberFormat = fmt.jpy;
inputs.getRange("B25").format.numberFormat = fmt.pct;
inputs.getRange("B26").dataValidation = { rule: { type: "list", values: ["Post-Seed", "Post-A", "Post-B"] } };

inputs.getRange("A31:C34").values = [
  ["Case", "PSR / Revenue multiple", "Profit multiple"],
  ["Low", 5.0, 15.0],
  ["Base", 8.0, 20.0],
  ["High", 12.0, 30.0],
];
header(inputs, "A31:C31");
inputStyle(inputs, "B32:C34");
inputs.getRange("B32:C34").format.numberFormat = fmt.multiple;

inputs.getRange("A37:D41").values = [
  ["Forecast year", "Revenue", "Profit margin", "Operating profit"],
  [2027, 50000000, 0.00, null],
  [2028, 150000000, 0.10, null],
  [2029, 400000000, 0.20, null],
  [2030, 800000000, 0.30, null],
];
inputs.getRange("D38").formulas = [["=B38*C38"]];
inputs.getRange("D38:D41").fillDown();
header(inputs, "A37:D37");
inputStyle(inputs, "A38:C41");
formulaStyle(inputs, "D38:D41");
inputs.getRange("A38:A41").format.numberFormat = "0";
inputs.getRange("B38:B41").format.numberFormat = fmt.jpy;
inputs.getRange("C38:C41").format.numberFormat = fmt.pct;
inputs.getRange("D38:D41").format.numberFormat = fmt.jpy;

inputs.getRange("A44:D47").values = [
  ["Legend", "Style", "Meaning", "Notes"],
  ["Input", "Blue text / yellow fill", "Editable assumption", "Change these cells to simulate"],
  ["Formula", "Black text", "Calculated output", "Do not hardcode unless intentionally changing the model"],
  ["Source", "Sources sheet", "Assumptions/audit trail", "User-provided and illustrative inputs only"],
];
header(inputs, "A44:D44");
noteStyle(inputs, "A45:D47");

addComment(inputs, "B5", "Source: user prompt on 2026-06-30. Initial stated capital assumption.");
addComment(inputs, "B8", "Assumption: IP/technology transfer is not modeled as equity consideration by default.");
addComment(inputs, "B9", "Source: user prompt on 2026-06-30. Planned common-share financing amount.");
addComment(inputs, "B10", "Source: user prompt on 2026-06-30. Target investor ownership around 8%.");
addComment(inputs, "B11", "Assumption: 10% option pool included for planning. Adjust to match hiring plan and investor negotiation.");
addComment(inputs, "B12", "Model toggle. After SO pool means the investor target is measured after creating the option pool.");
addComment(inputs, "B24", "Assumption: net cash bridge for valuation. Replace with actual cash, debt, and financing fees when available.");

// Cap table
title(cap, "Capital Policy / Cap Table", "A1:F1");
cap.freezePanes.freezeRows(3);
setWidths(cap, { A: 280, B: 130, C: 130, D: 130, E: 130, F: 420 });

section(cap, "A3", "Round Summary", 6);
cap.getRange("A4:F15").values = [
  ["Metric", "Initial", "Post-Seed", "Post-A", "Post-B", "Notes"],
  ["Financing amount", null, null, null, null, "New cash raised in each round"],
  ["Price per share", null, null, null, null, "Investment / new investor shares"],
  ["Pre-money fully diluted valuation", null, null, null, null, "Post-money valuation minus new investment"],
  ["Post-money fully diluted valuation", null, null, null, null, "Price per share x post-round FD shares"],
  ["Cash-implied post-money", null, null, null, null, "Investment / target ownership"],
  ["New investor ownership", null, null, null, null, "Actual post-round ownership"],
  ["SO pool ownership", null, null, null, null, "Total option pool after round"],
  ["Total fully diluted shares", null, null, null, null, ""],
  ["Capital increase amount", null, null, null, null, "Financing x capitalization ratio"],
  ["Stated capital after round", null, null, null, null, "Illustrative; confirm with tax/legal advisors"],
  ["Capital reserve increase", null, null, null, null, ""],
];
header(cap, "A4:F4");

cap.getRange("B5:E5").formulas = [["=0", "='Inputs'!B9", "='Inputs'!B16", "='Inputs'!B19"]];
cap.getRange("B6:E6").formulas = [["=0", "=C5/C21", "=D5/D22", "=E5/E23"]];
cap.getRange("B7:E7").formulas = [["=B8-B5", "=C8-C5", "=D8-D5", "=E8-E5"]];
cap.getRange("B8:E8").formulas = [["='Inputs'!B5", "=C6*C25", "=D6*D25", "=E6*E25"]];
cap.getRange("B9:E9").formulas = [["=0", "=C5/'Inputs'!B10", "=D5/'Inputs'!B17", "=E5/'Inputs'!B20"]];
cap.getRange("B10:E10").formulas = [["=0", "=C21/C25", "=D22/D25", "=E23/E25"]];
cap.getRange("B11:E11").formulas = [["=B24/B25", "=C24/C25", "=D24/D25", "=E24/E25"]];
cap.getRange("B12:E12").formulas = [["=B25", "=C25", "=D25", "=E25"]];
cap.getRange("B13:E13").formulas = [["='Inputs'!B5", "=C5*'Inputs'!B13", "=D5*'Inputs'!B13", "=E5*'Inputs'!B13"]];
cap.getRange("B14:E14").formulas = [["='Inputs'!B5", "=B14+C13", "=C14+D13", "=D14+E13"]];
cap.getRange("B15:E15").formulas = [["=0", "=C5-C13", "=D5-D13", "=E5-E13"]];
formulaStyle(cap, "B5:E15");
totalStyle(cap, "A12:E12");
cap.getRange("B5:E5").format.numberFormat = fmt.jpy;
cap.getRange("B6:E6").format.numberFormat = fmt.price;
cap.getRange("B7:E9").format.numberFormat = fmt.jpy;
cap.getRange("B10:E11").format.numberFormat = fmt.pct;
cap.getRange("B12:E12").format.numberFormat = fmt.shares;
cap.getRange("B13:E15").format.numberFormat = fmt.jpy;

section(cap, "A18", "Share Count", 5);
cap.getRange("A19:E26").values = [
  ["Holder", "Initial", "Post-Seed", "Post-A", "Post-B"],
  ["Founder", null, null, null, null],
  ["Seed investor", null, null, null, null],
  ["Series A investor", null, null, null, null],
  ["Series B investor", null, null, null, null],
  ["SO pool", null, null, null, null],
  ["Total fully diluted shares", null, null, null, null],
  ["Check: sum above", null, null, null, null],
];
header(cap, "A19:E19");
cap.getRange("B20:E20").formulas = [["='Inputs'!B6", "=B20", "=C20", "=D20"]];
cap.getRange("B21:E21").formulas = [["=0", "=IF('Inputs'!B12=\"After SO pool\",'Inputs'!B10*'Inputs'!B6/(1-'Inputs'!B10-'Inputs'!B11),'Inputs'!B6/(1-'Inputs'!B10)-'Inputs'!B6)", "=C21", "=D21"]];
cap.getRange("B22:E22").formulas = [["=0", "=0", "=IF(('Inputs'!B18*(C25-C24)/(1-'Inputs'!B17-'Inputs'!B18))>=C24,'Inputs'!B17*(C25-C24)/(1-'Inputs'!B17-'Inputs'!B18),'Inputs'!B17*C25/(1-'Inputs'!B17))", "=D22"]];
cap.getRange("B23:E23").formulas = [["=0", "=0", "=0", "=IF(('Inputs'!B21*(D25-D24)/(1-'Inputs'!B20-'Inputs'!B21))>=D24,'Inputs'!B20*(D25-D24)/(1-'Inputs'!B20-'Inputs'!B21),'Inputs'!B20*D25/(1-'Inputs'!B20))"]];
cap.getRange("B24:E24").formulas = [["=0", "=IF('Inputs'!B12=\"After SO pool\",'Inputs'!B11*'Inputs'!B6/(1-'Inputs'!B10-'Inputs'!B11),'Inputs'!B11*('Inputs'!B6/(1-'Inputs'!B10))/(1-'Inputs'!B11))", "=IF(('Inputs'!B18*(C25-C24)/(1-'Inputs'!B17-'Inputs'!B18))>=C24,'Inputs'!B18*(C25-C24)/(1-'Inputs'!B17-'Inputs'!B18),C24)", "=IF(('Inputs'!B21*(D25-D24)/(1-'Inputs'!B20-'Inputs'!B21))>=D24,'Inputs'!B21*(D25-D24)/(1-'Inputs'!B20-'Inputs'!B21),D24)"]];
cap.getRange("B25:E25").formulas = [["=SUM(B20:B24)", "=SUM(C20:C24)", "=SUM(D20:D24)", "=SUM(E20:E24)"]];
cap.getRange("B26:E26").formulas = [["=B25", "=C25", "=D25", "=E25"]];
formulaStyle(cap, "B20:E26");
totalStyle(cap, "A25:E26");
cap.getRange("B20:E26").format.numberFormat = fmt.shares;

section(cap, "A29", "Ownership %", 5);
cap.getRange("A30:E36").values = [
  ["Holder", "Initial", "Post-Seed", "Post-A", "Post-B"],
  ["Founder", null, null, null, null],
  ["Seed investor", null, null, null, null],
  ["Series A investor", null, null, null, null],
  ["Series B investor", null, null, null, null],
  ["SO pool", null, null, null, null],
  ["Total", null, null, null, null],
];
header(cap, "A30:E30");
cap.getRange("B31:E35").formulas = [
  ["=B20/B25", "=C20/C25", "=D20/D25", "=E20/E25"],
  ["=B21/B25", "=C21/C25", "=D21/D25", "=E21/E25"],
  ["=B22/B25", "=C22/C25", "=D22/D25", "=E22/E25"],
  ["=B23/B25", "=C23/C25", "=D23/D25", "=E23/E25"],
  ["=B24/B25", "=C24/C25", "=D24/D25", "=E24/E25"],
];
cap.getRange("B36:E36").formulas = [["=SUM(B31:B35)", "=SUM(C31:C35)", "=SUM(D31:D35)", "=SUM(E31:E35)"]];
formulaStyle(cap, "B31:E36");
totalStyle(cap, "A36:E36");
cap.getRange("B31:E36").format.numberFormat = fmt.pct;

section(cap, "A39", "Capital Threshold Flag", 5);
cap.getRange("A40:E41").values = [
  ["Metric", "Initial", "Post-Seed", "Post-A", "Post-B"],
  ["Stated capital <= JPY 50,000,000", null, null, null, null],
];
header(cap, "A40:E40");
cap.getRange("B41:E41").formulas = [["=IF(B14<=50000000,\"OK\",\"Over 50M\")", "=IF(C14<=50000000,\"OK\",\"Over 50M\")", "=IF(D14<=50000000,\"OK\",\"Over 50M\")", "=IF(E14<=50000000,\"OK\",\"Over 50M\")"]];
formulaStyle(cap, "B41:E41");

cap.getRange("A44:F47").values = [
  ["Important note", "", "", "", "", ""],
  ["This is an illustrative planning model, not legal, tax, accounting, or investment advice.", "", "", "", "", ""],
  ["The technology/IP transfer is intentionally kept out of equity issuance by default; document ownership/licensing separately.", "", "", "", "", ""],
  ["Confirm capital/reserve allocation, taxes, and investment terms with counsel, tax accountant, and judicial scrivener before execution.", "", "", "", "", ""],
];
noteStyle(cap, "A44:F47");

// Valuation simulation
title(val, "Valuation Simulation", "A1:N1");
val.freezePanes.freezeRows(3);
setWidths(val, { A: 90, B: 85, C: 125, D: 150, E: 105, F: 120, G: 160, H: 110, I: 150, J: 140, K: 125, L: 135, M: 112, N: 145, O: 165 });

section(val, "A3", "Financing-implied Valuation Metrics", 8);
val.getRange("A4:G8").values = [
  ["Year", "Revenue", "Operating profit", "Seed FD post", "PSR at seed FD", "Profit multiple at seed FD", "Notes"],
  [null, null, null, null, null, null, ""],
  [null, null, null, null, null, null, ""],
  [null, null, null, null, null, null, ""],
  [null, null, null, null, null, null, ""],
];
header(val, "A4:G4");
val.getRange("A5:A8").formulas = [["='Inputs'!A38"], ["='Inputs'!A39"], ["='Inputs'!A40"], ["='Inputs'!A41"]];
val.getRange("B5:C8").formulas = [
  ["='Inputs'!B38", "='Inputs'!D38"],
  ["='Inputs'!B39", "='Inputs'!D39"],
  ["='Inputs'!B40", "='Inputs'!D40"],
  ["='Inputs'!B41", "='Inputs'!D41"],
];
val.getRange("D5:D8").formulas = [["='Cap Table'!C8"], ["='Cap Table'!C8"], ["='Cap Table'!C8"], ["='Cap Table'!C8"]];
val.getRange("E5:E8").formulas = [["=IF(B5>0,D5/B5,\"\")"], ["=IF(B6>0,D6/B6,\"\")"], ["=IF(B7>0,D7/B7,\"\")"], ["=IF(B8>0,D8/B8,\"\")"]];
val.getRange("F5:F8").formulas = [["=IF(C5>0,D5/C5,\"n.m.\")"], ["=IF(C6>0,D6/C6,\"n.m.\")"], ["=IF(C7>0,D7/C7,\"n.m.\")"], ["=IF(C8>0,D8/C8,\"n.m.\")"]];
val.getRange("G5:G8").values = [["Seed FD post vs forecast"], ["Seed FD post vs forecast"], ["Seed FD post vs forecast"], ["Seed FD post vs forecast"]];
formulaStyle(val, "A5:F8");
val.getRange("B5:D8").format.numberFormat = fmt.jpy;
val.getRange("E5:F8").format.numberFormat = fmt.multiple;

section(val, "A11", "Operating Multiple Valuation Cases", 14);
val.getRange("A12:O24").values = [
  ["Case", "Year", "Revenue", "Profit margin", "Operating profit", "PSR", "EV from PSR", "Profit multiple", "EV from profit multiple", "Blended EV", "Net cash / (debt)", "Equity value", "FD shares", "Implied price/share", "1億 investment ownership"],
  ["Low", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Low", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Low", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Low", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Base", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Base", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Base", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["Base", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["High", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["High", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["High", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ["High", null, null, null, null, null, null, null, null, null, null, null, null, null, null],
];
header(val, "A12:O12");
for (let r = 13; r <= 24; r++) {
  const idx = ((r - 13) % 4) + 38;
  val.getRange(`B${r}:E${r}`).formulas = [[`='Inputs'!A${idx}`, `='Inputs'!B${idx}`, `='Inputs'!C${idx}`, `='Inputs'!D${idx}`]];
  val.getRange(`F${r}`).formulas = [[`=IF($A${r}="Low",'Inputs'!$B$32,IF($A${r}="Base",'Inputs'!$B$33,'Inputs'!$B$34))`]];
  val.getRange(`G${r}`).formulas = [[`=C${r}*F${r}`]];
  val.getRange(`H${r}`).formulas = [[`=IF($A${r}="Low",'Inputs'!$C$32,IF($A${r}="Base",'Inputs'!$C$33,'Inputs'!$C$34))`]];
  val.getRange(`I${r}`).formulas = [[`=IF(E${r}>0,E${r}*H${r},0)`]];
  val.getRange(`J${r}`).formulas = [[`=IF(E${r}>0,'Inputs'!$B$25*G${r}+(1-'Inputs'!$B$25)*I${r},G${r})`]];
  val.getRange(`K${r}`).formulas = [["='Inputs'!$B$24"]];
  val.getRange(`L${r}`).formulas = [[`=J${r}+K${r}`]];
  val.getRange(`M${r}`).formulas = [[`=IF('Inputs'!$B$26="Post-Seed",'Cap Table'!$C$26,IF('Inputs'!$B$26="Post-A",'Cap Table'!$D$26,'Cap Table'!$E$26))`]];
  val.getRange(`N${r}`).formulas = [[`=L${r}/M${r}`]];
  val.getRange(`O${r}`).formulas = [[`='Inputs'!$B$9/(L${r}+'Inputs'!$B$9)`]];
}
formulaStyle(val, "B13:O24");
val.getRange("C13:C24").format.numberFormat = fmt.jpy;
val.getRange("D13:D24").format.numberFormat = fmt.pct;
val.getRange("E13:E24").format.numberFormat = fmt.jpy;
val.getRange("F13:F24").format.numberFormat = fmt.multiple;
val.getRange("G13:G24").format.numberFormat = fmt.jpy;
val.getRange("H13:H24").format.numberFormat = fmt.multiple;
val.getRange("I13:L24").format.numberFormat = fmt.jpy;
val.getRange("M13:M24").format.numberFormat = fmt.shares;
val.getRange("N13:N24").format.numberFormat = fmt.price;
val.getRange("O13:O24").format.numberFormat = fmt.pct;

// Scenarios
title(scenarios, "Sensitivity Scenarios", "A1:G1");
scenarios.freezePanes.freezeRows(3);
setWidths(scenarios, { A: 160, B: 120, C: 120, D: 120, E: 120, F: 120, G: 260 });

section(scenarios, "A3", "Equity Value by Revenue and PSR", 6);
scenarios.getRange("A4:F10").values = [
  ["PSR \\ Revenue", 100000000, 250000000, 500000000, 1000000000, 2000000000],
  [4.0, null, null, null, null, null],
  [6.0, null, null, null, null, null],
  [8.0, null, null, null, null, null],
  [10.0, null, null, null, null, null],
  [12.0, null, null, null, null, null],
  [15.0, null, null, null, null, null],
];
header(scenarios, "A4:F4");
inputStyle(scenarios, "B4:F4");
inputStyle(scenarios, "A5:A10");
for (let r = 5; r <= 10; r++) {
  scenarios.getRange(`B${r}:F${r}`).formulas = [[`=B$4*$A${r}+'Inputs'!$B$24`, `=C$4*$A${r}+'Inputs'!$B$24`, `=D$4*$A${r}+'Inputs'!$B$24`, `=E$4*$A${r}+'Inputs'!$B$24`, `=F$4*$A${r}+'Inputs'!$B$24`]];
}
formulaStyle(scenarios, "B5:F10");
scenarios.getRange("A5:A10").format.numberFormat = fmt.multiple;
scenarios.getRange("B4:F10").format.numberFormat = fmt.jpy;

section(scenarios, "A13", "Equity Value by Revenue, Profit Margin, and Profit Multiple", 6);
scenarios.getRange("A14:F22").values = [
  ["Revenue scenario", 100000000, 250000000, 500000000, 1000000000, 2000000000],
  ["Profit multiple", 20.0, "", "", "", ""],
  ["Profit margin \\ Revenue", null, null, null, null, null],
  [0.05, null, null, null, null, null],
  [0.10, null, null, null, null, null],
  [0.20, null, null, null, null, null],
  [0.30, null, null, null, null, null],
  [0.40, null, null, null, null, null],
  [0.50, null, null, null, null, null],
];
header(scenarios, "A14:F14");
inputStyle(scenarios, "B14:F14");
inputStyle(scenarios, "B15");
inputStyle(scenarios, "A17:A22");
for (let r = 17; r <= 22; r++) {
  scenarios.getRange(`B${r}:F${r}`).formulas = [[`=B$14*$A${r}*$B$15+'Inputs'!$B$24`, `=C$14*$A${r}*$B$15+'Inputs'!$B$24`, `=D$14*$A${r}*$B$15+'Inputs'!$B$24`, `=E$14*$A${r}*$B$15+'Inputs'!$B$24`, `=F$14*$A${r}*$B$15+'Inputs'!$B$24`]];
}
formulaStyle(scenarios, "B17:F22");
scenarios.getRange("B14:F14").format.numberFormat = fmt.jpy;
scenarios.getRange("B15").format.numberFormat = fmt.multiple;
scenarios.getRange("A17:A22").format.numberFormat = fmt.pct;
scenarios.getRange("B17:F22").format.numberFormat = fmt.jpy;

section(scenarios, "A25", "Ownership at JPY 100M Investment by Pre-money Valuation", 6);
scenarios.getRange("A26:F28").values = [
  ["Pre-money valuation", 500000000, 1000000000, 1150000000, 1500000000, 2000000000],
  ["Investor ownership", null, null, null, null, null],
  ["Post-money valuation", null, null, null, null, null],
];
header(scenarios, "A26:F26");
inputStyle(scenarios, "B26:F26");
scenarios.getRange("B27:F27").formulas = [["='Inputs'!$B$9/(B26+'Inputs'!$B$9)", "='Inputs'!$B$9/(C26+'Inputs'!$B$9)", "='Inputs'!$B$9/(D26+'Inputs'!$B$9)", "='Inputs'!$B$9/(E26+'Inputs'!$B$9)", "='Inputs'!$B$9/(F26+'Inputs'!$B$9)"]];
scenarios.getRange("B28:F28").formulas = [["=B26+'Inputs'!$B$9", "=C26+'Inputs'!$B$9", "=D26+'Inputs'!$B$9", "=E26+'Inputs'!$B$9", "=F26+'Inputs'!$B$9"]];
formulaStyle(scenarios, "B27:F28");
scenarios.getRange("B26:F26").format.numberFormat = fmt.jpy;
scenarios.getRange("B27:F27").format.numberFormat = fmt.pct;
scenarios.getRange("B28:F28").format.numberFormat = fmt.jpy;

// Checks
title(checks, "Model Checks", "A1:G1");
checks.freezePanes.freezeRows(3);
setWidths(checks, { A: 260, B: 120, C: 120, D: 100, E: 90, F: 90, G: 460 });
checks.getRange("A3:G3").values = [["Check", "Actual", "Expected", "Difference", "Tolerance", "Status", "Notes"]];
header(checks, "A3:G3");
checks.getRange("A4:G13").values = [
  ["Initial ownership sums to 100%", null, 1.0, null, 0.00001, null, ""],
  ["Seed ownership sums to 100%", null, 1.0, null, 0.00001, null, ""],
  ["Series A ownership sums to 100%", null, 1.0, null, 0.00001, null, ""],
  ["Series B ownership sums to 100%", null, 1.0, null, 0.00001, null, ""],
  ["Seed investor ownership matches basis", null, null, null, 0.00001, null, "If basis is Before SO pool, final ownership is diluted by the pool."],
  ["Seed SO pool matches target", null, null, null, 0.00001, null, ""],
  ["No negative shares", null, 1.0, null, 0.00001, null, ""],
  ["Post-Seed stated capital <= JPY 50M", null, 1.0, null, 0.00001, null, "普通株1億円を半分資本金に入れると設立時100万円込みで5,100万円になります。"],
  ["Valuation outputs positive", null, 1.0, null, 0.00001, null, ""],
  ["Model status", null, null, null, null, null, "PASS means hard checks pass; WARN may still require advisor review."],
];
checks.getRange("B4:B7").formulas = [["='Cap Table'!B36"], ["='Cap Table'!C36"], ["='Cap Table'!D36"], ["='Cap Table'!E36"]];
checks.getRange("D4:D7").formulas = [["=B4-C4"], ["=B5-C5"], ["=B6-C6"], ["=B7-C7"]];
checks.getRange("F4:F7").formulas = [["=IF(ABS(D4)<=E4,\"OK\",\"CHECK\")"], ["=IF(ABS(D5)<=E5,\"OK\",\"CHECK\")"], ["=IF(ABS(D6)<=E6,\"OK\",\"CHECK\")"], ["=IF(ABS(D7)<=E7,\"OK\",\"CHECK\")"]];
checks.getRange("B8:C8").formulas = [["='Cap Table'!C32", "=IF('Inputs'!B12=\"After SO pool\",'Inputs'!B10,'Inputs'!B10*(1-'Inputs'!B11))"]];
checks.getRange("D8").formulas = [["=B8-C8"]];
checks.getRange("F8").formulas = [["=IF(ABS(D8)<=E8,\"OK\",\"CHECK\")"]];
checks.getRange("B9:C9").formulas = [["='Cap Table'!C35", "='Inputs'!B11"]];
checks.getRange("D9").formulas = [["=B9-C9"]];
checks.getRange("F9").formulas = [["=IF(ABS(D9)<=E9,\"OK\",\"CHECK\")"]];
checks.getRange("B10").formulas = [["=IF(MIN('Cap Table'!B20:E24)>=0,1,0)"]];
checks.getRange("D10").formulas = [["=B10-C10"]];
checks.getRange("F10").formulas = [["=IF(B10=1,\"OK\",\"CHECK\")"]];
checks.getRange("B11").formulas = [["=IF('Cap Table'!C14<=50000000,1,0)"]];
checks.getRange("D11").formulas = [["=B11-C11"]];
checks.getRange("F11").formulas = [["=IF(B11=1,\"OK\",\"WARN\")"]];
checks.getRange("B12").formulas = [["=IF(MIN('Valuation Sim'!L13:L24)>0,1,0)"]];
checks.getRange("D12").formulas = [["=B12-C12"]];
checks.getRange("F12").formulas = [["=IF(B12=1,\"OK\",\"CHECK\")"]];
checks.getRange("F13").formulas = [["=IF(COUNTIF(F4:F12,\"CHECK\")=0,\"PASS\",\"FAIL\")"]];
formulaStyle(checks, "B4:F13");
checks.getRange("B4:E9").format.numberFormat = fmt.pct2;
checks.getRange("B10:E12").format.numberFormat = "0";
checks.getRange("F4:F13").conditionalFormats.add("containsText", { text: "OK", format: { fill: theme.green, font: { bold: true } } });
checks.getRange("F4:F13").conditionalFormats.add("containsText", { text: "PASS", format: { fill: theme.green, font: { bold: true } } });
checks.getRange("F4:F13").conditionalFormats.add("containsText", { text: "WARN", format: { fill: theme.paleYellow, font: { bold: true } } });
checks.getRange("F4:F13").conditionalFormats.add("containsText", { text: "CHECK", format: { fill: theme.red, font: { bold: true } } });
checks.getRange("F4:F13").conditionalFormats.add("containsText", { text: "FAIL", format: { fill: theme.red, font: { bold: true } } });

// Summary
title(summary, "Kairos Capital Policy & Valuation Simulator", "A1:H1");
summary.freezePanes.freezeRows(3);
setWidths(summary, { A: 245, B: 150, C: 150, D: 165, E: 165, F: 190, G: 180, H: 260 });
summary.getRange("A3:H3").values = [["Version", "2026-06-30", "Scenario", "Base / illustrative", "Currency", "JPY actual", "Status", null]];
summary.getRange("H3").formulas = [["='Checks'!F13"]];
header(summary, "A3:H3");

section(summary, "A5", "Key Financing Outputs", 5);
summary.getRange("A6:E14").values = [
  ["Metric", "Value", "Units", "Formula source", "Notes"],
  ["Seed post-money valuation", null, "JPY", "Cap Table", "Fully diluted after selected SO-pool treatment"],
  ["Seed pre-money valuation", null, "JPY", "Cap Table", "Post-money minus investment on FD basis"],
  ["Seed price per share", null, "JPY/share", "Cap Table", ""],
  ["Founder ownership after Seed", null, "%", "Cap Table", ""],
  ["Investor ownership after Seed", null, "%", "Cap Table", ""],
  ["SO pool after Seed", null, "%", "Cap Table", ""],
  ["Stated capital after Seed", null, "JPY", "Cap Table", "Assumes capitalization ratio from Inputs"],
  ["Post-Seed capital threshold", null, "flag", "Cap Table", "50M threshold flag only; confirm tax treatment"],
];
header(summary, "A6:E6");
summary.getRange("B7:B15").formulas = [
  ["='Cap Table'!C8"],
  ["='Cap Table'!C7"],
  ["='Cap Table'!C6"],
  ["='Cap Table'!C31"],
  ["='Cap Table'!C32"],
  ["='Cap Table'!C35"],
  ["='Cap Table'!C14"],
  ["='Cap Table'!C41"],
  [null],
];
formulaStyle(summary, "B7:B14");
summary.getRange("B7:B8").format.numberFormat = fmt.jpy;
summary.getRange("B9").format.numberFormat = fmt.price;
summary.getRange("B10:B12").format.numberFormat = fmt.pct;
summary.getRange("B13").format.numberFormat = fmt.jpy;

section(summary, "A17", "Base Case Valuation Snapshot", 7);
summary.getRange("A18:G22").values = [
  ["Year", "Revenue", "Profit margin", "Equity value", "Implied PSR", "Implied profit multiple", "1億 investment ownership"],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];
header(summary, "A18:G18");
summary.getRange("A19:G22").formulas = [
  ["='Valuation Sim'!B17", "='Valuation Sim'!C17", "='Valuation Sim'!D17", "='Valuation Sim'!L17", "=D19/B19", "=IF('Valuation Sim'!E17>0,D19/'Valuation Sim'!E17,\"n.m.\")", "='Valuation Sim'!O17"],
  ["='Valuation Sim'!B18", "='Valuation Sim'!C18", "='Valuation Sim'!D18", "='Valuation Sim'!L18", "=D20/B20", "=IF('Valuation Sim'!E18>0,D20/'Valuation Sim'!E18,\"n.m.\")", "='Valuation Sim'!O18"],
  ["='Valuation Sim'!B19", "='Valuation Sim'!C19", "='Valuation Sim'!D19", "='Valuation Sim'!L19", "=D21/B21", "=IF('Valuation Sim'!E19>0,D21/'Valuation Sim'!E19,\"n.m.\")", "='Valuation Sim'!O19"],
  ["='Valuation Sim'!B20", "='Valuation Sim'!C20", "='Valuation Sim'!D20", "='Valuation Sim'!L20", "=D22/B22", "=IF('Valuation Sim'!E20>0,D22/'Valuation Sim'!E20,\"n.m.\")", "='Valuation Sim'!O20"],
];
formulaStyle(summary, "A19:G22");
summary.getRange("B19:B22").format.numberFormat = fmt.jpy;
summary.getRange("C19:C22").format.numberFormat = fmt.pct;
summary.getRange("D19:D22").format.numberFormat = fmt.jpy;
summary.getRange("E19:F22").format.numberFormat = fmt.multiple;
summary.getRange("G19:G22").format.numberFormat = fmt.pct;

summary.getRange("A25:H29").values = [
  ["How to use", "", "", "", "", "", "", ""],
  ["1. Edit yellow/blue input cells on the Inputs sheet.", "", "", "", "", "", "", ""],
  ["2. Review dilution and share counts on Cap Table.", "", "", "", "", "", "", ""],
  ["3. Use Valuation Sim and Scenarios to compare PSR, profit multiple, and investment ownership.", "", "", "", "", "", "", ""],
  ["4. Check the Checks sheet before relying on the model.", "", "", "", "", "", "", ""],
];
noteStyle(summary, "A25:H29");

// Sources
title(sources, "Sources / Audit Trail", "A1:I1");
sources.freezePanes.freezeRows(3);
setWidths(sources, { A: 210, B: 150, C: 110, D: 120, E: 180, F: 240, G: 160, H: 160, I: 440 });
sources.getRange("A3:I15").values = [
  ["Item", "Value", "Units", "Period / as-of", "Source type", "Source name / ref", "Owner", "Accessed / refreshed", "Notes"],
  ["Initial stated capital", 1000000, "JPY", "2026-06-30", "User input", "Chat prompt", "Founder / user", "2026-06-30", "Initial plan assumption"],
  ["Seed financing amount", 100000000, "JPY", "2026-06-30", "User input", "Chat prompt", "Founder / user", "2026-06-30", "Planned common-share financing"],
  ["Seed investor target ownership", 0.08, "%", "2026-06-30", "User input", "Chat prompt", "Founder / user", "2026-06-30", "Around 8%"],
  ["SO pool", 0.10, "%", "2026-06-30", "Illustrative assumption", "Model default", "Founder / user", "2026-06-30", "Adjust to hiring plan"],
  ["Future Series A/B rounds", "Illustrative", "n/a", "Future", "Illustrative assumption", "Model default", "Founder / user", "2026-06-30", "Not a financing recommendation"],
  ["Revenue forecast", "Illustrative", "JPY", "2027-2030", "Illustrative assumption", "Model default", "Founder / user", "2026-06-30", "Replace with operating plan"],
  ["PSR and profit multiples", "Illustrative", "x", "2026-06-30", "Illustrative assumption", "Model default", "Founder / user", "2026-06-30", "No market comps embedded"],
  ["Capital/reserve allocation", "50%", "%", "2026-06-30", "Illustrative assumption", "Model default", "Founder / user", "2026-06-30", "Confirm legal/tax treatment before execution"],
  ["Technology/IP transfer", "0", "JPY equity value", "2026-06-30", "Modeling assumption", "Model default", "Founder / user", "2026-06-30", "Handled outside cap table by contract/licensing in this model"],
  ["Legal/tax advice", "Not provided", "n/a", "2026-06-30", "Caveat", "n/a", "n/a", "2026-06-30", "Use professional advisors before issuing shares or transferring IP"],
  ["Workbook", "v1", "n/a", "2026-06-30", "Generated", "Codex", "Codex", "2026-06-30", "Formulas are intended as an editable planning template"],
  ["", "", "", "", "", "", "", "", ""],
];
header(sources, "A3:I3");
formulaStyle(sources, "A4:I14");
sources.getRange("B4:B5").format.numberFormat = fmt.jpy;
sources.getRange("B6:B7").format.numberFormat = fmt.pct;
sources.getRange("I4:I14").format.wrapText = true;

// General row/column polish
for (const sheet of [summary, inputs, cap, val, scenarios, checks, sources]) {
  sheet.getRange("A1:O120").format.wrapText = false;
  sheet.getRange("A1:O120").format.autofitRows();
}

// Render previews for visual QA.
const previewSheets = [
  ["Summary", "A1:H29"],
  ["Inputs", "A1:F47"],
  ["Cap Table", "A1:F47"],
  ["Valuation Sim", "A1:O24"],
  ["Scenarios", "A1:G28"],
  ["Checks", "A1:G13"],
  ["Sources", "A1:I14"],
];

for (const [sheetName, range] of previewSheets) {
  const preview = await workbook.render({
    sheetName,
    range,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(`${outputDir}/${sheetName.replaceAll(" ", "_").toLowerCase()}_preview.png`, new Uint8Array(await preview.arrayBuffer()));
}

const inspection = await workbook.inspect({
  kind: "table",
  range: "Summary!A1:H29",
  include: "values,formulas",
  tableMaxRows: 30,
  tableMaxCols: 8,
});
console.log(inspection.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`Saved ${outputPath}`);

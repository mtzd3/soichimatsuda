function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = false;
        continue;
      }

      field += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\r") {
      if (next === "\n") {
        index += 1;
      }

      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((value) => value.trim() !== ""));
}

function createNode(label) {
  return {
    nodeView: {
      content: escapeHtml(label),
    },
    children: [],
  };
}

function trimPath(row) {
  return row.map((value) => value.trim()).filter(Boolean);
}

function prune(node) {
  if (!node.children || node.children.length === 0) {
    delete node.children;
    return node;
  }

  node.children = node.children.map(prune);
  return node;
}

function setTopLevelDirections(root) {
  if (!root.children) {
    return root;
  }

  root.children.forEach((child, index) => {
    if (index % 2 === 0) {
      child.direction = "start";
    }
  });

  return root;
}

export function buildGraph(paths) {
  const registry = new Map();
  let root;
  let rootLabel;

  for (const rawPath of paths) {
    const path = trimPath(rawPath);
    if (path.length === 0) {
      continue;
    }

    if (!root) {
      rootLabel = path[0];
      root = createNode(rootLabel);
      registry.set(rootLabel, root);
    }

    if (path[0] !== rootLabel) {
      throw new Error("This importer expects exactly one root label in column 1.");
    }

    let parent = root;
    let parentKey = rootLabel;

    for (let depth = 1; depth < path.length; depth += 1) {
      const label = path[depth];
      const nodeKey = `${parentKey}>>${label}`;

      if (!registry.has(nodeKey)) {
        const node = createNode(label);
        parent.children.push(node);
        registry.set(nodeKey, node);
      }

      parent = registry.get(nodeKey);
      parentKey = nodeKey;
    }
  }

  if (!root) {
    throw new Error("No data rows were found in the CSV.");
  }

  return prune(setTopLevelDirections(root));
}

export function csvTextToGraph(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error("Please provide a CSV with a header row and at least one data row.");
  }

  return buildGraph(rows.slice(1));
}

export function countNodes(node) {
  if (!node.children) {
    return 1;
  }

  return 1 + node.children.reduce((total, child) => total + countNodes(child), 0);
}

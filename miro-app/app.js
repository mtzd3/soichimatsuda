import { countNodes, csvTextToGraph } from "./mindmap.js";

const sampleButton = document.querySelector("#load-sample");
const createButton = document.querySelector("#create-mindmap");
const fileInput = document.querySelector("#csv-file");
const summary = document.querySelector("#summary");
const status = document.querySelector("#status");
const csvInput = document.querySelector("#csv-input");

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#a43f13" : "#5f584d";
}

function updateSummary() {
  const text = csvInput.value.trim();
  if (!text) {
    summary.textContent = "CSV is empty.";
    createButton.disabled = true;
    return;
  }

  try {
    const graph = csvTextToGraph(text);
    summary.textContent = `${countNodes(graph)} nodes ready to import.`;
    createButton.disabled = false;
  } catch (error) {
    summary.textContent = error.message;
    createButton.disabled = true;
  }
}

async function loadSample() {
  const response = await fetch("../data/proposed-mindmap.csv");
  if (!response.ok) {
    throw new Error("Could not load the reviewed sample CSV.");
  }

  csvInput.value = await response.text();
  updateSummary();
  setStatus("Reviewed sample loaded.");
}

async function createMindmap() {
  if (!window.miro?.board?.experimental?.createMindmapNode) {
    throw new Error("Open this page inside an installed Miro app to create a mind map.");
  }

  const graph = csvTextToGraph(csvInput.value);
  const viewport = await miro.board.viewport.get();

  graph.x = viewport.x + viewport.width / 2;
  graph.y = viewport.y + viewport.height / 2;

  const root = await miro.board.experimental.createMindmapNode(graph);

  if (miro.board.viewport?.zoomTo) {
    await miro.board.viewport.zoomTo(root);
  }

  setStatus(`Imported ${countNodes(graph)} nodes to the current board.`);
}

sampleButton.addEventListener("click", async () => {
  sampleButton.disabled = true;
  setStatus("Loading reviewed sample...");

  try {
    await loadSample();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    sampleButton.disabled = false;
  }
});

fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  csvInput.value = await file.text();
  updateSummary();
  setStatus(`Loaded ${file.name}.`);
});

csvInput.addEventListener("input", updateSummary);

createButton.addEventListener("click", async () => {
  createButton.disabled = true;
  setStatus("Creating mind map on the current board...");

  try {
    await createMindmap();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    updateSummary();
  }
});

updateSummary();

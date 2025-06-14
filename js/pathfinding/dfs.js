const rows = 20;
const cols = 20;
const grid = document.getElementById("grid");
let cells = [];
let shouldStop = false;

function createGrid() {
  grid.innerHTML = "";
  cells = [];
  shouldStop = false;
  document.getElementById("noPathMsg").classList.add("hidden");
  document.getElementById("dimOverlay").classList.add("hidden");

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      grid.appendChild(cell);
      row.push(cell);
    }
    cells.push(row);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.30) {
        cells[r][c].classList.add("wall");
      }
    }
  }

  function getRandomCell() {
    let r, c;
    do {
      r = Math.floor(Math.random() * rows);
      c = Math.floor(Math.random() * cols);
    } while (cells[r][c].classList.contains("wall"));
    return [r, c];
  }

  const [startR, startC] = getRandomCell();
  cells[startR][startC].classList.add("start");
  cells[startR][startC].textContent = "S";

  let endR, endC;
  do {
    [endR, endC] = getRandomCell();
  } while (startR === endR && startC === endC);

  cells[endR][endC].classList.add("end");
  cells[endR][endC].textContent = "E";

  window.startPos = [startR, startC];
  window.endPos = [endR, endC];
}

function getNeighbors(r, c) {
  const neighbors = [];
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      if (!cells[nr][nc].classList.contains("wall")) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

async function dfs() {
  shouldStop = false;

  const stack = [];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));

  const [startR, startC] = window.startPos;
  const [endR, endC] = window.endPos;

  stack.push([startR, startC]);
  visited[startR][startC] = true;

  while (stack.length > 0) {
    if (shouldStop) return;
    const [r, c] = stack.pop();

    if (r === endR && c === endC) break;

    for (const [nr, nc] of getNeighbors(r, c)) {
      if (!visited[nr][nc]) {
        visited[nr][nc] = true;
        prev[nr][nc] = [r, c];
        stack.push([nr, nc]);

        const cell = cells[nr][nc];
        if (!cell.classList.contains("end")) {
          cell.classList.add("visited");
          if (shouldStop) return;
          await new Promise(res => setTimeout(res, 10));
          if (shouldStop) return;
        }
      }
    }
  }

  if (!prev[endR][endC]) {
    document.getElementById("noPathMsg").classList.remove("hidden");
    document.getElementById("dimOverlay").classList.remove("hidden");
    setUIState("after");
    return;
  }

  let cur = [endR, endC];
  const path = [];

  while (prev[cur[0]][cur[1]]) {
    path.push(cur);
    cur = prev[cur[0]][cur[1]];
  }

  path.reverse();
  for (const [r, c] of path) {
    if (shouldStop) return;
    const cell = cells[r][c];
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      cell.classList.remove("visited");
      cell.classList.add("path");
      if (shouldStop) return;
      await new Promise(res => setTimeout(res, 25));
      if (shouldStop) return;
    }
  }

  setUIState("after");
}

function setUIState(state) {
  const startBtn = document.getElementById("startBtn");
  const randomizeBtn = document.getElementById("randomizeBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (state === "before") {
    startBtn.classList.remove("hidden");
    randomizeBtn.classList.remove("hidden");
    cancelBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
  } else if (state === "during") {
    startBtn.classList.add("hidden");
    randomizeBtn.classList.add("hidden");
    cancelBtn.classList.remove("hidden");
    resetBtn.classList.add("hidden");
  } else if (state === "after") {
    startBtn.classList.add("hidden");
    randomizeBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
    resetBtn.classList.remove("hidden");
  }
}

// Button event handlers
document.getElementById("startBtn").addEventListener("click", async () => {
  setUIState("during");
  await dfs();
});

document.getElementById("randomizeBtn").addEventListener("click", () => {
  createGrid();
  setUIState("before");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  shouldStop = true;
  setTimeout(() => {
    createGrid();
    setUIState("before");
  }, 10);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  shouldStop = true;
  setTimeout(() => {
    createGrid();
    setUIState("before");
  }, 0);
});

window.addEventListener("DOMContentLoaded", () => {
  createGrid();
  setUIState("before");
});

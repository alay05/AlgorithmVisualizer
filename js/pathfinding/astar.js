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

function heuristic(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

async function astar() {
  shouldStop = false;

  const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const openSet = [];

  const [startR, startC] = window.startPos;
  const [endR, endC] = window.endPos;

  gScore[startR][startC] = 0;
  fScore[startR][startC] = heuristic(startR, startC, endR, endC);
  openSet.push([fScore[startR][startC], startR, startC]);

  while (openSet.length > 0) {
    if (shouldStop) return;
    openSet.sort((a, b) => a[0] - b[0]);
    const [_, r, c] = openSet.shift();

    if (r === endR && c === endC) break;

    for (const [nr, nc] of getNeighbors(r, c)) {
      const tentativeG = gScore[r][c] + 1;
      if (tentativeG < gScore[nr][nc]) {
        prev[nr][nc] = [r, c];
        gScore[nr][nc] = tentativeG;
        fScore[nr][nc] = tentativeG + heuristic(nr, nc, endR, endC);
        openSet.push([fScore[nr][nc], nr, nc]);

        const cell = cells[nr][nc];
        if (!cell.classList.contains("end")) {
          cell.classList.add("visited");
          await new Promise(res => setTimeout(res, 10));
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
      await new Promise(res => setTimeout(res, 25));
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

document.getElementById("startBtn").addEventListener("click", async () => {
  setUIState("during");
  await astar();
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

const rows = 20;
const cols = 20;
const grid = document.getElementById("grid");
let cells = [];
let shouldStop = false;

function createGrid() {
  grid.innerHTML = "";
  cells = [];
  shouldStop = false;

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
      if (Math.random() < 0.25) {
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

async function bfs() {
  shouldStop = false;

  const queue = [];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));

  const [startR, startC] = window.startPos;
  const [endR, endC] = window.endPos;

  queue.push([startR, startC]);
  visited[startR][startC] = true;

  while (queue.length > 0) {
    if (shouldStop) return;
    const [r, c] = queue.shift();

    if (r === endR && c === endC) break;

    for (const [nr, nc] of getNeighbors(r, c)) {
      if (!visited[nr][nc]) {
        visited[nr][nc] = true;
        prev[nr][nc] = [r, c];
        queue.push([nr, nc]);

        const cell = cells[nr][nc];
        if (!cell.classList.contains("end")) {
          cell.classList.add("visited");
          await new Promise(res => setTimeout(res, 10));
          if (shouldStop) return;
        }
      }
    }
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
}

document.getElementById("startBtn").addEventListener("click", bfs);
document.getElementById("resetBtn").addEventListener("click", () => {
  shouldStop = true;
  createGrid();
});

window.addEventListener("DOMContentLoaded", createGrid);
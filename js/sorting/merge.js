const container = document.getElementById("bar-container");

const startBtn = document.getElementById("startBtn");
const randomizeBtn = document.getElementById("randomizeBtn");
const cancelBtn = document.getElementById("cancelBtn");
const resetBtn = document.getElementById("resetBtn");

const speedSlider = document.getElementById("speedRange");
const sizeSlider = document.getElementById("sizeRange");

const DEFAULT_SPEED = 50;
const DEFAULT_SIZE = 30;

let arr = [];
let isSorting = false;
let delay = 101 - DEFAULT_SPEED;
let originalArray = [];

function setStage(stage) {
  startBtn.classList.add("hidden");
  randomizeBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");

  const disableSliders = stage !== "before";
  speedSlider.disabled = disableSliders;
  sizeSlider.disabled = disableSliders;
  speedSlider.classList.toggle("opacity-70", disableSliders);
  sizeSlider.classList.toggle("opacity-70", disableSliders);

  if (stage === "before") {
    startBtn.classList.remove("hidden");
    randomizeBtn.classList.remove("hidden");
  } else if (stage === "during") {
    cancelBtn.classList.remove("hidden");
  } else if (stage === "after") {
    resetBtn.classList.remove("hidden");
  }
}

function generateArray(size = DEFAULT_SIZE) {
  arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
  drawBars();
}

function drawBars(highlight = [], greenUntil = -1) {
  container.innerHTML = "";
  arr.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.style.height = `${val * 2}px`;

    let color = "bg-blue-500";
    if (highlight.includes(i)) color = "bg-red-500";
    else if (i <= greenUntil) color = "bg-green-500";

    bar.className = `w-2 ${color} transition-all duration-100`;
    container.appendChild(bar);
  });
}

function randomizeArray() {
  if (isSorting) return;
  generateArray(parseInt(sizeSlider.value));
  originalArray = [...arr];
}

function resetArray() {
  if (isSorting) return;
  speedSlider.value = DEFAULT_SPEED;
  sizeSlider.value = DEFAULT_SIZE;
  delay = 101 - DEFAULT_SPEED;
  generateArray(DEFAULT_SIZE);
  originalArray = [...arr];
  setStage("before");
}

function cancelSort() {
  isSorting = false;
  speedSlider.value = DEFAULT_SPEED;
  sizeSlider.value = DEFAULT_SIZE;
  delay = 101 - DEFAULT_SPEED;
  generateArray(DEFAULT_SIZE);
  originalArray = [...arr];
  setStage("before");
}

async function mergeSort(start, end) {
  if (end - start <= 1 || !isSorting) return;

  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid, end);

  let merged = [];
  let i = start, j = mid;

  while (i < mid && j < end && isSorting) {
    drawBars([i, j]);
    await new Promise(r => setTimeout(r, delay));
    if (arr[i] <= arr[j]) {
      merged.push(arr[i++]);
    } else {
      merged.push(arr[j++]);
    }
  }

  while (i < mid) merged.push(arr[i++]);
  while (j < end) merged.push(arr[j++]);

  for (let k = 0; k < merged.length && isSorting; k++) {
    arr[start + k] = merged[k];
    drawBars([start + k]);
    await new Promise(r => setTimeout(r, delay));
  }
}

async function startSort() {
  if (isSorting) return;
  isSorting = true;
  originalArray = [...arr];
  setStage("during");

  await mergeSort(0, arr.length);

  if (isSorting) {
    await sweepGreen();
    setStage("after");
  }

  isSorting = false;
}

async function sweepGreen() {
  for (let i = 0; i < arr.length; i++) {
    drawBars([], i);
    await new Promise(r => setTimeout(r, 10));
  }
}

startBtn.addEventListener("click", startSort);
randomizeBtn.addEventListener("click", randomizeArray);
cancelBtn.addEventListener("click", cancelSort);
resetBtn.addEventListener("click", resetArray);

speedSlider.addEventListener("input", () => {
  delay = 101 - parseInt(speedSlider.value);
});
sizeSlider.addEventListener("input", () => {
  if (!isSorting) generateArray(parseInt(sizeSlider.value));
});

speedSlider.value = DEFAULT_SPEED;
sizeSlider.value = DEFAULT_SIZE;
generateArray(DEFAULT_SIZE);
originalArray = [...arr];
setStage("before");

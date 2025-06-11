const container = document.getElementById("bar-container");
const startBtn = document.getElementById("startBtn");
let arr = [];

function generateArray(size = 30) {
  arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
  drawBars();
}

function drawBars() {
  container.innerHTML = "";
  for (let value of arr) {
    const bar = document.createElement("div");
    bar.style.height = `${value * 2}px`;
    bar.className = "w-2 bg-blue-500 transition-all duration-200";
    container.appendChild(bar);
  }
}

async function bubbleSort() {
  let bars = container.children;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        drawBars();
        await new Promise(r => setTimeout(r, 50));
      }
    }
  }
}

startBtn.addEventListener("click", bubbleSort);
generateArray();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const angleModeBtn = document.getElementById("angleModeBtn");
const angleControl = document.getElementById("angleControl");
const angleSlider = document.getElementById("angleSlider");
const angleValue = document.getElementById("angleValue");
const closeAngleBtn = document.getElementById("closeAngleBtn");

let bars = [];
let joints = [];
let isAngleMode = false;
let selectedJoint = null;

// 角度調整モード切替
angleModeBtn.addEventListener("click", () => {
  isAngleMode = !isAngleMode;
  alert(isAngleMode ? "角度調整モード ON：関節をクリックしてください" : "角度調整モード OFF");
});

// キャンバスクリック
canvas.addEventListener("click", (e) => {
  if (!isAngleMode) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 関節をクリックしたかチェック
  selectedJoint = joints.find(j => Math.hypot(j.x - x, j.y - y) < 8);
  if (selectedJoint) {
    angleControl.style.display = "block";
    angleSlider.value = selectedJoint.angle || 0;
    angleValue.textContent = `${angleSlider.value}°`;
  }
});

// 角度スライダー操作
angleSlider.addEventListener("input", () => {
  if (selectedJoint) {
    selectedJoint.angle = parseInt(angleSlider.value);
    angleValue.textContent = `${angleSlider.value}°`;
    draw();
  }
});

// 閉じるボタン
closeAngleBtn.addEventListener("click", () => {
  angleControl.style.display = "none";
  selectedJoint = null;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 3;
  ctx.fillStyle = "yellow";

  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
  }

  for (let j of joints) {
    ctx.beginPath();
    ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

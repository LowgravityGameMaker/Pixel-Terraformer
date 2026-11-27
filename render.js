let rotOffset = 0;
let renderTimer = null;

const STARS = [];
for (let i = 0; i < 45; i++) {
  STARS.push({
    x: Math.floor(Math.random() * 55) * 4,
    y: Math.floor(Math.random() * 55) * 4,
    bright: i % 2 === 0
  });
}

function startRenderLoop() {
  if (renderTimer) clearInterval(renderTimer);
  renderTimer = setInterval(function() {
    rotOffset += 0.12;
    if (typeof state !== "undefined" && state.stats) {
      drawPlanet(state.stats);
    }
  }, 180);
}

function drawPlanet(stats) {
  const canvas = document.getElementById("planet-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 220;
  const cx = 110;
  const cy = 110;
  const radius = 92; // 캔버스를 거의 꽉 채우는 크기
  const pixelSize = 4;

  ctx.clearRect(0, 0, size, size);

  // 우주 별
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    const blink = (Math.floor(rotOffset * 3) + i) % 5 === 0;
    ctx.fillStyle = blink ? "#ffffff" : (s.bright ? "#447766" : "#224433");
    ctx.fillRect(s.x, s.y, 2, 2);
  }

  // 대기권 글로우
  if (stats.press > 15) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 9, 0, Math.PI * 2);
    ctx.fillStyle = stats.o2 > 10 ? "rgba(0, 190, 255, 0.28)" : "rgba(220, 140, 80, 0.22)";
    ctx.fill();
  }

  // 행성 도트 표면
  for (let y = 0; y < size; y += pixelSize) {
    for (let x = 0; x < size; x += pixelSize) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const nx = x + rotOffset * 14;
        const noise = (Math.sin(nx * 0.065) + Math.cos(y * 0.065) + Math.sin((nx + y) * 0.04) + 3) * 16.6;
        const cloudNoise = (Math.sin((nx * 1.4) * 0.075) + Math.cos(y * 0.09) + 2) * 25;
        const shade = (dx + dy > 40) ? 0.6 : 1.0;

        let r = 160, g = 82, b = 45;
        if (stats.temp < -15 && noise < stats.water + 15) {
          r = 210; g = 240; b = 255;
        } else if (noise < stats.water && stats.temp >= -15 && stats.temp <= 85) {
          r = 20; g = 115; b = 225;
        } else {
          const bioRatio = Math.min(1, stats.bio / 80);
          r = Math.floor(160 * (1 - bioRatio) + 45 * bioRatio);
          g = Math.floor(85 * (1 - bioRatio) + 180 * bioRatio);
          b = Math.floor(50 * (1 - bioRatio) + 65 * bioRatio);
        }

        if (stats.water > 25 && stats.press > 30 && cloudNoise > 78) {
          r = Math.floor(r * 0.3 + 245 * 0.7);
          g = Math.floor(g * 0.3 + 250 * 0.7);
          b = Math.floor(b * 0.3 + 255 * 0.7);
        }

        ctx.fillStyle = "rgb(" + Math.floor(r * shade) + "," + Math.floor(g * shade) + "," + Math.floor(b * shade) + ")";
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }
}

function drawRadar(stats) {
  const canvas = document.getElementById("radar-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = 68, cy = 70, maxR = 42;

  ctx.clearRect(0, 0, 136, 136);

  const labels = ["온도", "기압", "수위", "산소", "생태"];
  const ratios = [
    Math.max(0, Math.min(1, (stats.temp + 85) / 200)),
    Math.max(0, Math.min(1, stats.press / 202)),
    Math.max(0, Math.min(1, stats.water / 140)),
    Math.max(0, Math.min(1, stats.o2 / 42)),
    Math.max(0, Math.min(1, stats.bio / 160))
  ];

  // 외곽 가이드선
  ctx.strokeStyle = "#132e20";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * maxR;
    const y = cy + Math.sin(angle) * maxR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // 지구 목표 기준선
  ctx.strokeStyle = "#2b6648";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (maxR * 0.5);
    const y = cy + Math.sin(angle) * (maxR * 0.5);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // 현재 행성 수치 다각형
  ctx.fillStyle = "rgba(51, 255, 119, 0.32)";
  ctx.strokeStyle = "#33ff77";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = maxR * ratios[i];
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 오각형 각 꼭짓점 이름 라벨
  ctx.fillStyle = "#88ccaa";
  ctx.font = "10px 'Galmuri11', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (maxR + 15);
    const ly = cy + Math.sin(angle) * (maxR + 15);
    ctx.fillText(labels[i], lx, ly);
  }
}

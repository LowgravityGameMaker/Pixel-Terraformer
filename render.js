let rotOffset = 0;
let animFrameId = null;

// 고정된 배경 별 좌표 생성
const STARS = Array.from({ length: 28 }, () => ({
  x: Math.floor(Math.random() * 40) * 4,
  y: Math.floor(Math.random() * 40) * 4,
  bright: Math.random() > 0.5
}));

function startRenderLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  let lastTime = 0;

  function loop(time) {
    if (time - lastTime > 180) { // 도트 감성 프레임 속도
      rotOffset += 0.12;
      if (typeof state !== "undefined" && state.stats) {
        drawPlanet(state.stats);
      }
      lastTime = time;
    }
    animFrameId = requestAnimationFrame(loop);
  }
  animFrameId = requestAnimationFrame(loop);
}

function drawPlanet(stats) {
  const canvas = document.getElementById("planet-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 56;
  const pixelSize = 4;

  ctx.clearRect(0, 0, size, size);

  // 1. 우주 배경 별 그리기
  STARS.forEach((s, i) => {
    const blink = (Math.floor(rotOffset * 3) + i) % 5 === 0;
    ctx.fillStyle = blink ? "#ffffff" : (s.bright ? "#447766" : "#224433");
    ctx.fillRect(s.x, s.y, 2, 2);
  });

  // 2. 대기권 글로우
  if (stats.press > 15) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = stats.o2 > 10 ? "rgba(0, 190, 255, 0.25)" : "rgba(220, 140, 80, 0.2)";
    ctx.fill();
  }

  // 3. 자전하는 도트 행성 표면 렌더링
  for (let y = 0; y < size; y += pixelSize) {
    for (let x = 0; x < size; x += pixelSize) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // 구체 곡률 반영한 회전 좌표
        const nx = x + rotOffset * 12;
        const noise = (Math.sin(nx * 0.08) + Math.cos(y * 0.08) + Math.sin((nx + y) * 0.05) + 3) * 16.6;
        const cloudNoise = (Math.sin((nx * 1.4) * 0.09) + Math.cos(y * 0.11) + 2) * 25;

        const shade = (dx + dy > 24) ? 0.6 : 1.0;
        let r = 160, g = 82, b = 45;

        if (stats.temp < -15 && noise < stats.water + 15) {
          r = 210; g = 240; b = 255; // 빙하
        } else if (noise < stats.water && stats.temp >= -15 && stats.temp <= 85) {
          r = 20; g = 115; b = 225; // 바다
        } else {
          const bioRatio = Math.min(1, stats.bio / 80);
          r = Math.floor(160 * (1 - bioRatio) + 45 * bioRatio);
          g = Math.floor(85 * (1 - bioRatio) + 180 * bioRatio);
          b = Math.floor(50 * (1 - bioRatio) + 65 * bioRatio);
        }

        // 구름층 오버레이 (수위 25% 이상 & 기압 30 이상일 때 형성)
        if (stats.water > 25 && stats.press > 30 && cloudNoise > 78) {
          r = Math.floor(r * 0.3 + 245 * 0.7);
          g = Math.floor(g * 0.3 + 250 * 0.7);
          b = Math.floor(b * 0.3 + 255 * 0.7);
        }

        ctx.fillStyle = `rgb(${Math.floor(r * shade)}, ${Math.floor(g * shade)}, ${Math.floor(b * shade)})`;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }
}

function drawRadar(stats) {
  const canvas = document.getElementById("radar-canvas");
  const ctx = canvas.getContext("2d");
  const cx = 55, cy = 55, maxR = 42;

  ctx.clearRect(0, 0, 110, 110);

  const ratios = [
    Math.max(0, Math.min(1, (stats.temp + 85) / 200)),
    Math.max(0, Math.min(1, stats.press / 202)),
    Math.max(0, Math.min(1, stats.water / 140)),
    Math.max(0, Math.min(1, stats.o2 / 42)),
    Math.max(0, Math.min(1, stats.bio / 160))
  ];

  ctx.strokeStyle = "#1f4d36";
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

  ctx.fillStyle = "rgba(51, 255, 119, 0.3)";
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
}

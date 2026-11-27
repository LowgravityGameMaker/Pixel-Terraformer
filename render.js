
function drawPlanet(stats) {
  const canvas = document.getElementById("planet-canvas");
  const ctx = canvas.getContext("2d");
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 58;
  const pixelSize = 4; // 도트 크기

  ctx.clearRect(0, 0, size, size);

  // 대기권 글로우 (기압에 따라 변화)
  if (stats.press > 20) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = stats.o2 > 10 ? "rgba(0, 180, 255, 0.25)" : "rgba(200, 150, 100, 0.2)";
    ctx.fill();
  }

  // 픽셀 단위 행성 렌더링
  for (let y = 0; y < size; y += pixelSize) {
    for (let x = 0; x < size; x += pixelSize) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // 간단한 의사 노이즈로 지형 높이 생성 (0 ~ 100)
        const noise = (Math.sin(x * 0.08) + Math.cos(y * 0.08) + Math.sin((x + y) * 0.05) + 3) * 16.6;
        
        // 그림자 효과 (우측 하단 어둡게)
        const shade = (dx + dy > 25) ? 0.65 : 1.0;

        let r = 160, g = 82, b = 45; // 기본 붉은/갈색 암석

        if (stats.temp < -15 && noise < stats.water + 15) {
          // 빙하 (얼음)
          r = 210; g = 240; b = 255;
        } else if (noise < stats.water && stats.temp >= -15 && stats.temp <= 80) {
          // 액체 바다
          r = 20; g = 110; b = 220;
        } else {
          // 육지 (생태계 수치에 따라 녹색화)
          const bioRatio = Math.min(1, stats.bio / 80);
          r = Math.floor(160 * (1 - bioRatio) + 45 * bioRatio);
          g = Math.floor(85 * (1 - bioRatio) + 175 * bioRatio);
          b = Math.floor(50 * (1 - bioRatio) + 65 * bioRatio);
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

  // 각 지표를 0~1 범위로 정규화 (0.5가 지구 기준 목표치)
  const ratios = [
    Math.max(0, Math.min(1, (stats.temp + 85) / 200)), // -85 ~ 115 (15가 0.5)
    Math.max(0, Math.min(1, stats.press / 202)),        // 0 ~ 202 (101이 0.5)
    Math.max(0, Math.min(1, stats.water / 140)),        // 0 ~ 140 (70이 0.5)
    Math.max(0, Math.min(1, stats.o2 / 42)),            // 0 ~ 42 (21이 0.5)
    Math.max(0, Math.min(1, stats.bio / 160))           // 0 ~ 160 (80이 0.5)
  ];

  // 기준선 (지구 목표치 = 0.5 반지름)
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

  // 현재 행성 수치 다각형
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

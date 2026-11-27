
let state = {
  rankIdx: 0,
  planetIdx: 0,
  day: 1,
  budget: 400,
  stats: {},
  owned: {} // { heater: { count: 1, active: true } }
};

function initPlanet(idx) {
  const p = PLANETS[idx % PLANETS.length];
  state.planetIdx = idx;
  state.day = 1;
  state.budget = p.startBudget;
  state.stats = { ...p.stats };
  state.owned = {};
  FACILITIES.forEach(f => {
    state.owned[f.id] = { count: 0, active: true };
  });
  setLog(`[배정 완료] ${p.name} 프로젝트 착수. 납기일 ${p.deadline}일 내 유사율 97% 달성 요망.`);
  updateUI();
}

function setLog(msg) {
  document.getElementById("log-message").innerText = msg;
}

function calculateESI() {
  const s = state.stats;
  const t = EARTH_TARGET;
  // 각 지표별 오차율 계산 (오버슈팅도 똑같이 감점)
  const diffTemp = Math.min(1, Math.abs(s.temp - t.temp) / 100);
  const diffPress = Math.min(1, Math.abs(s.press - t.press) / 150);
  const diffWater = Math.min(1, Math.abs(s.water - t.water) / 100);
  const diffO2 = Math.min(1, Math.abs(s.o2 - t.o2) / 30);
  const diffBio = Math.min(1, Math.abs(s.bio - t.bio) / 100);

  const avgScore = 1 - (diffTemp + diffPress + diffWater + diffO2 + diffBio) / 5;
  return Math.max(0, Math.min(100, avgScore * 100));
}

function buildFacility(id) {
  const fac = FACILITIES.find(f => f.id === id);
  if (state.budget >= fac.cost) {
    state.budget -= fac.cost;
    state.owned[id].count++;
    state.owned[id].active = true;
    SFX.build();
    setLog(`[건설] ${fac.name} 1기 가동 시작.`);
    updateUI();
  } else {
    SFX.alert();
    setLog(`[경고] 예산이 부족합니다! (필요: ${fac.cost} Cr)`);
  }
}

function toggleFacility(id) {
  if (state.owned[id].count === 0) return;
  state.owned[id].active = !state.owned[id].active;
  SFX.click();
  updateUI();
}

function nextDay() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  let dailyUpkeep = 0;

  // 1. 가동 중인 설비 효과 및 유지비 합산
  FACILITIES.forEach(f => {
    const item = state.owned[f.id];
    if (item.count > 0 && item.active) {
      dailyUpkeep += f.upkeep * item.count;
      state.stats.temp += f.effect.temp * item.count;
      state.stats.press += f.effect.press * item.count;
      state.stats.water += f.effect.water * item.count;
      state.stats.o2 += f.effect.o2 * item.count;
      state.stats.bio += f.effect.bio * item.count;
    }
  });

  // 2. 지표 간 연쇄 작용 (기획서 3.1)
  if (state.stats.temp > 85) {
    state.stats.water = Math.max(0, state.stats.water - 3); // 고온 증발
  }
  if (state.stats.temp < -10 || state.stats.press < 15) {
    state.stats.bio = Math.max(0, state.stats.bio - 2); // 혹한/저기압 생태 위축
  }

  // 수치 범위 제한
  state.stats.water = Math.max(0, Math.min(100, state.stats.water));
  state.stats.o2 = Math.max(0, Math.min(100, state.stats.o2));
  state.stats.bio = Math.max(0, Math.min(100, state.stats.bio));
  state.stats.press = Math.max(0, state.stats.press);

  // 3. 예산 정산 및 날짜 경과
  state.budget += (p.dailyGrant - dailyUpkeep);
  state.day++;
  SFX.nextDay();

  // 4. 25% 확률로 돌발 이벤트 발생
  if (Math.random() < 0.25) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    setLog(ev.msg);
    if (ev.budget) state.budget += ev.budget;
    if (ev.effect) {
      state.stats.temp += ev.effect.temp;
      state.stats.press += ev.effect.press;
      state.stats.water = Math.max(0, state.stats.water + ev.effect.water);
      state.stats.bio = Math.max(0, state.stats.bio + ev.effect.bio);
    }
    SFX.alert();
  }

  // 5. 파산 / 납기 초과 게임오버 판정
  if (state.budget < 0) {
    SFX.alert();
    alert("[해고 통보] 프로젝트 예산 파산으로 징계 해고되었습니다!");
    state.rankIdx = 0;
    initPlanet(0);
    return;
  }
  if (state.day > p.deadline) {
    SFX.alert();
    alert("[해고 통보] 본사 납기일을 초과하여 계약이 해지되었습니다!");
    state.rankIdx = 0;
    initPlanet(0);
    return;
  }

  updateUI();
}

function completeProject() {
  const esi = calculateESI();
  if (esi < 97) return;

  SFX.win();
  const bonus = esi >= 99 ? 300 : 150;
  state.rankIdx = Math.min(RANKS.length - 1, state.rankIdx + 1);
  alert(`[프로젝트 성공!] 최종 지구 유사율 ${esi.toFixed(1)}%\n성과 보너스 +${bonus} Cr 획득 및 '${RANKS[state.rankIdx]}' 승진!`);
  initPlanet(state.planetIdx + 1);
}

function updateUI() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  document.getElementById("rank-badge").innerText = RANKS[state.rankIdx];
  document.getElementById("planet-name").innerText = p.name;
  document.getElementById("day-counter").innerText = `DAY ${state.day} / ${p.deadline}`;
  document.getElementById("budget-val").innerText = state.budget;

  // 순수익 계산
  let upkeep = 0;
  FACILITIES.forEach(f => {
    if (state.owned[f.id].active) upkeep += f.upkeep * state.owned[f.id].count;
  });
  const net = p.dailyGrant - upkeep;
  const netEl = document.getElementById("net-income");
  netEl.innerText = (net >= 0 ? "+" : "") + net;
  netEl.style.color = net >= 0 ? "#33ff77" : "#ff5555";

  // 5대 지표 게이지 갱신
  const s = state.stats;
  document.getElementById("val-temp").innerText = `${s.temp}°C`;
  document.getElementById("bar-temp").style.width = `${Math.max(0, Math.min(100, (s.temp + 85) / 2))}%`;

  document.getElementById("val-press").innerText = `${s.press}kPa`;
  document.getElementById("bar-press").style.width = `${Math.max(0, Math.min(100, s.press / 2))}%`;

  document.getElementById("val-water").innerText = `${s.water}%`;
  document.getElementById("bar-water").style.width = `${s.water}%`;

  document.getElementById("val-o2").innerText = `${s.o2}%`;
  document.getElementById("bar-o2").style.width = `${Math.min(100, s.o2 * 2.5)}%`;

  document.getElementById("val-bio").innerText = `${s.bio}%`;
  document.getElementById("bar-bio").style.width = `${s.bio}%`;

  // 지구 유사율 & 완료 버튼 표시
  const esi = calculateESI();
  document.getElementById("esi-val").innerText = esi.toFixed(1);
  const compBtn = document.getElementById("complete-btn");
  if (esi >= 97) compBtn.classList.remove("hidden");
  else compBtn.classList.add("hidden");

  // 설비 버튼 렌더링
  const listEl = document.getElementById("facility-list");
  listEl.innerHTML = "";
  FACILITIES.forEach(f => {
    const owned = state.owned[f.id];
    const card = document.createElement("div");
    card.className = "fac-card";
    card.innerHTML = `
      <div class="fac-header">
        <span>${f.name} (${owned.count})</span>
        <span>${f.cost}Cr</span>
      </div>
      <div style="color:#88ccaa; font-size:10px;">${f.desc} (유지-${f.upkeep})</div>
      <div class="fac-btns">
        <button onclick="buildFacility('${f.id}')">건설</button>
        <button class="${owned.active ? '' : 'off'}" onclick="toggleFacility('${f.id}')">
          ${owned.count === 0 ? '-' : (owned.active ? 'ON' : 'OFF')}
        </button>
      </div>
    `;
    listEl.appendChild(card);
  });

  // 그래픽 렌더링
  drawPlanet(state.stats);
  drawRadar(state.stats);
}

// 게임 시작
window.onload = () => initPlanet(0);

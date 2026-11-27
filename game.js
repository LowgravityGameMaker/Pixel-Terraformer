let state = {
  rankIdx: 0,
  planetIdx: 0,
  day: 1,
  budget: 400,
  stats: {},
  owned: {},
  completedQuests: [],
  unreadMail: true
};

function initPlanet(idx) {
  const p = PLANETS[idx % PLANETS.length];
  state.planetIdx = idx;
  state.day = 1;
  state.budget = p.startBudget;
  state.stats = { ...p.stats };
  state.owned = {};
  state.completedQuests = [];
  state.unreadMail = true;

  FACILITIES.forEach(f => {
    state.owned[f.id] = { count: 0, active: true };
  });

  setLog(`[배정] ${p.name}: ${p.desc}`);
  updateUI();
  startRenderLoop();
}

function setLog(msg) {
  document.getElementById("log-message").innerText = msg;
}

function getDefenseRate() {
  let shield = Math.min(40, Math.floor(state.stats.press * 0.35)); // 두꺼운 대기의 자연 방어
  FACILITIES.forEach(f => {
    const item = state.owned[f.id];
    if (item && item.active && f.effect.shield) {
      shield += f.effect.shield * item.count;
    }
  });
  return Math.min(95, shield);
}

function calculateESI() {
  const s = state.stats;
  const t = EARTH_TARGET;
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
  if (state.rankIdx < fac.unlockRank) {
    SFX.alert();
    setLog(`[권한 부족] '${RANKS[fac.unlockRank]}' 직급 이상만 결재 가능한 설비입니다.`);
    return;
  }
  if (state.budget >= fac.cost) {
    state.budget -= fac.cost;
    state.owned[id].count++;
    state.owned[id].active = true;
    SFX.build();
    setLog(`[설비 가동] ${fac.name} 건설 완료.`);
    updateUI();
  } else {
    SFX.alert();
    setLog(`[예산 부족] 필요 예산: ${fac.cost} Cr`);
  }
}

function toggleFacility(id) {
  if (state.owned[id].count === 0) return;
  state.owned[id].active = !state.owned[id].active;
  SFX.click();
  updateUI();
}

function openMail() {
  SFX.click();
  state.unreadMail = false;
  document.getElementById("mail-dot").classList.add("hidden");
  const content = document.getElementById("mail-content");
  const p = PLANETS[state.planetIdx % PLANETS.length];

  let html = `
    <div class="mail-item">
      <strong>발신: 본사 인사/관제팀</strong><br>
      현재 배정 행성: <b>${p.name}</b><br>
      지시사항: 납기일(${p.deadline}일) 내 지구 유사율 97% 이상 달성 시 승진 심사 대상이 됩니다.
    </div>
  `;

  QUESTS.forEach(q => {
    const isDone = state.completedQuests.includes(q.id);
    const canClaim = !isDone && q.check(state.stats);
    html += `
      <div class="mail-item">
        <strong>${q.title}</strong> (보상: +${q.reward}Cr)<br>
        ${q.desc}
        ${isDone
          ? `<div style="color:#33ff77; margin-top:4px;">✔ 정산 완료</div>`
          : (canClaim
            ? `<button class="quest-btn" onclick="claimQuest('${q.id}')">[성과금 수령하기]</button>`
            : `<div style="color:#888; margin-top:4px;">진행 중...</div>`)
        }
      </div>
    `;
  });

  content.innerHTML = html;
  document.getElementById("mail-modal").classList.remove("hidden");
}

function closeMail() {
  SFX.click();
  document.getElementById("mail-modal").classList.add("hidden");
}

function claimQuest(qId) {
  const q = QUESTS.find(item => item.id === qId);
  if (!q || state.completedQuests.includes(qId)) return;
  state.completedQuests.push(qId);
  state.budget += q.reward;
  SFX.win();
  setLog(`[퀘스트 보상] ${q.title} 달성! +${q.reward} Cr 입금.`);
  openMail();
  updateUI();
}

function nextDay() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  let dailyUpkeep = 0;

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

  // 지표 연쇄 작용
  if (state.stats.temp > 85) state.stats.water = Math.max(0, state.stats.water - 3);
  if (state.stats.temp < -10 || state.stats.press < 15) state.stats.bio = Math.max(0, state.stats.bio - 2);

  state.stats.water = Math.max(0, Math.min(100, state.stats.water));
  state.stats.o2 = Math.max(0, Math.min(100, state.stats.o2));
  state.stats.bio = Math.max(0, Math.min(100, state.stats.bio));
  state.stats.press = Math.max(0, state.stats.press);

  state.budget += (p.dailyGrant - dailyUpkeep);
  state.day++;
  SFX.nextDay();

  // 새로 달성 가능한 퀘스트가 생기면 메일 알림 표시
  const hasClaimable = QUESTS.some(q => !state.completedQuests.includes(q.id) && q.check(state.stats));
  if (hasClaimable) {
    state.unreadMail = true;
    setLog("[메일 수신] 단기 퀘스트 목표를 달성했습니다! 우측 상단 ✉ 메일함을 확인하세요.");
  }

  // 돌발 이벤트 및 재해 방어율 판정
  if (Math.random() < 0.28) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    if (ev.effect && (ev.effect.temp > 0 || ev.effect.bio < 0)) {
      const def = getDefenseRate();
      if (Math.random() * 100 < def) {
        setLog(`[방어 성공] 대기 및 자기장 방패(방어율 ${def}%)가 우주 재해를 막아냈습니다!`);
      } else {
        setLog(ev.msg);
        state.stats.temp += ev.effect.temp;
        state.stats.press = Math.max(0, state.stats.press + ev.effect.press);
        state.stats.bio = Math.max(0, state.stats.bio + ev.effect.bio);
        SFX.alert();
      }
    } else {
      setLog(ev.msg);
      if (ev.budget) state.budget += ev.budget;
    }
  }

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
  const bonus = esi >= 99 ? 350 : 150;
  state.rankIdx = Math.min(RANKS.length - 1, state.rankIdx + 1);
  alert(`[프로젝트 성공!] 최종 지구 유사율 ${esi.toFixed(1)}%\n성과 보너스 +${bonus} Cr 획득 및 '${RANKS[state.rankIdx]}' 승진!\n(새로운 거대 공학 설비가 해금되었습니다)`);
  initPlanet(state.planetIdx + 1);
}

function updateUI() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  document.getElementById("rank-badge").innerText = RANKS[state.rankIdx];
  document.getElementById("planet-name").innerText = p.name;
  document.getElementById("day-counter").innerText = `D-${state.day}/${p.deadline}`;
  document.getElementById("budget-val").innerText = state.budget;
  document.getElementById("shield-status").innerText = `재해 방어율: ${getDefenseRate()}%`;

  const dotEl = document.getElementById("mail-dot");
  if (state.unreadMail) dotEl.classList.remove("hidden");
  else dotEl.classList.add("hidden");

  let upkeep = 0;
  FACILITIES.forEach(f => {
    if (state.owned[f.id].active) upkeep += f.upkeep * state.owned[f.id].count;
  });
  const net = p.dailyGrant - upkeep;
  const netEl = document.getElementById("net-income");
  netEl.innerText = (net >= 0 ? "+" : "") + net;
  netEl.style.color = net >= 0 ? "#33ff77" : "#ff5555";

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

  const esi = calculateESI();
  document.getElementById("esi-val").innerText = esi.toFixed(1);
  const compBtn = document.getElementById("complete-btn");
  if (esi >= 97) compBtn.classList.remove("hidden");
  else compBtn.classList.add("hidden");

  const listEl = document.getElementById("facility-list");
  listEl.innerHTML = "";
  FACILITIES.forEach(f => {
    const owned = state.owned[f.id];
    const isLocked = state.rankIdx < f.unlockRank;
    const card = document.createElement("div");
    card.className = "fac-card" + (isLocked ? " locked" : "");

    if (isLocked) {
      card.innerHTML = `
        <div class="fac-header"><span>🔒 ${f.name}</span></div>
        <div style="color:#ffcc00; font-size:10px;">[${RANKS[f.unlockRank]}] 승진 시 해금</div>
      `;
    } else {
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
    }
    listEl.appendChild(card);
  });

  drawRadar(state.stats);
}

window.onload = () => initPlanet(0);

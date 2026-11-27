let state = {
  rankIdx: 0,
  planetIdx: 0,
  day: 1,
  budget: 420,
  stats: { temp: -35, press: 20, water: 10, o2: 2, bio: 0 },
  owned: {},
  completedQuests: [],
  unreadMail: true
};

let typingTimer = null;

function initPlanet(idx) {
  const p = PLANETS[idx % PLANETS.length];
  state.planetIdx = idx;
  state.day = 1;
  state.budget = p.startBudget;
  state.stats = Object.assign({}, p.stats);
  state.owned = {};
  state.completedQuests = [];
  state.unreadMail = true;

  FACILITIES.forEach(function(f) {
    state.owned[f.id] = { count: 0, active: true };
  });

  setLog("[배정] " + p.name + ": " + p.desc);
  updateUI();
  if (typeof startRenderLoop === "function") startRenderLoop();
}

function setLog(msg) {
  const el = document.getElementById("log-message");
  if (!el) return;
  if (typingTimer) clearInterval(typingTimer);

  el.textContent = "";
  let i = 0;
  typingTimer = setInterval(function() {
    el.textContent += msg.charAt(i);
    if (i % 2 === 0 && typeof SFX !== "undefined" && SFX.type) SFX.type();
    i++;
    if (i >= msg.length) clearInterval(typingTimer);
  }, 20);
}

function getDefenseRate() {
  let shield = Math.min(40, Math.floor(state.stats.press * 0.35));
  FACILITIES.forEach(function(f) {
    const item = state.owned[f.id];
    if (item && item.active && f.effect && f.effect.shield) {
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
  const fac = FACILITIES.find(function(f) { return f.id === id; });
  if (!fac) return;
  if (state.rankIdx < fac.unlockRank) {
    if (typeof SFX !== "undefined") SFX.alert();
    setLog("[권한 부족] '" + RANKS[fac.unlockRank] + "' 직급 이상만 결재 가능합니다.");
    return;
  }
  if (state.budget >= fac.cost) {
    state.budget -= fac.cost;
    if (!state.owned[id]) state.owned[id] = { count: 0, active: true };
    state.owned[id].count += 1;
    state.owned[id].active = true;
    if (typeof SFX !== "undefined") SFX.build();
    setLog("[설비 가동] " + fac.name + " 건설 완료! (퇴근 시 효과 적용)");
    updateUI();
  } else {
    if (typeof SFX !== "undefined") SFX.alert();
    setLog("[예산 부족] 필요 예산: " + fac.cost + " Cr");
  }
}

function toggleFacility(id) {
  if (!state.owned[id] || state.owned[id].count === 0) return;
  state.owned[id].active = !state.owned[id].active;
  if (typeof SFX !== "undefined") SFX.click();
  setLog("[전원 제어] 설비 상태를 " + (state.owned[id].active ? "ON" : "OFF") + "으로 전환했습니다.");
  updateUI();
}

function scrapFacility(id) {
  if (!state.owned[id] || state.owned[id].count === 0) return;
  const fac = FACILITIES.find(function(f) { return f.id === id; });
  const refund = Math.floor(fac.cost * 0.5);
  state.owned[id].count -= 1;
  state.budget += refund;
  if (typeof SFX !== "undefined" && SFX.scrap) SFX.scrap();
  setLog("[설비 철거] " + fac.name + " 해체 완료. (+" + refund + " Cr 환수)");
  updateUI();
}

function openMail() {
  if (typeof SFX !== "undefined") SFX.click();
  state.unreadMail = false;
  document.getElementById("mail-dot").classList.add("hidden");
  const content = document.getElementById("mail-content");
  const p = PLANETS[state.planetIdx % PLANETS.length];

  let html = '<div class="mail-item"><strong>발신: 본사 인사/관제팀</strong><br>현재 배정 행성: <b>' + p.name + '</b><br>납기일(' + p.deadline + '일) 내 지구 유사율 95% 이상 달성 요망.</div>';

  QUESTS.forEach(function(q) {
    const isDone = state.completedQuests.includes(q.id);
    const canClaim = !isDone && q.check(state.stats);
    html += '<div class="mail-item"><strong>' + q.title + '</strong> (보상: +' + q.reward + 'Cr)<br>' + q.desc;
    if (isDone) {
      html += '<div style="color:#33ff77; margin-top:4px;">✔ 정산 완료</div>';
    } else if (canClaim) {
      html += '<button class="quest-btn" onclick="claimQuest(\'' + q.id + '\')">[성과금 수령하기]</button>';
    } else {
      html += '<div style="color:#888; margin-top:4px;">진행 중...</div>';
    }
    html += '</div>';
  });

  content.innerHTML = html;
  document.getElementById("mail-modal").classList.remove("hidden");
}

function closeMail() {
  if (typeof SFX !== "undefined") SFX.click();
  document.getElementById("mail-modal").classList.add("hidden");
}

function claimQuest(qId) {
  const q = QUESTS.find(function(item) { return item.id === qId; });
  if (!q || state.completedQuests.includes(qId)) return;
  state.completedQuests.push(qId);
  state.budget += q.reward;
  if (typeof SFX !== "undefined") SFX.win();
  setLog("[퀘스트 보상] " + q.title + " 달성! +" + q.reward + " Cr 입금.");
  openMail();
  updateUI();
}

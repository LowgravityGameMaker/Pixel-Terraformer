const SAVE_KEY = "terra_corp_save_v3";

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

window.addEventListener("DOMContentLoaded", function() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const rankName = RANKS[parsed.rankIdx] || "인턴";
      const pName = PLANETS[parsed.planetIdx % PLANETS.length].name;
      const btn = document.getElementById("start-work-btn");
      const resetBtn = document.getElementById("reset-save-btn");
      if (btn) btn.textContent = "[이어서 근무하기: " + rankName + " / " + pName + " ▶]";
      if (resetBtn) resetBtn.classList.remove("hidden");
    } catch (e) {}
  }
});

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function resetSaveData() {
  if (confirm("저장된 직급과 행성 진행 기록을 초기화하고 인턴부터 다시 시작할까요?")) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
}

function startWork() {
  if (typeof SFX !== "undefined") SFX.win();
  const intro = document.getElementById("intro-screen");
  if (intro) intro.classList.add("hidden");

  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      setLog("[복귀 완료] 이전 관제 기록을 불러왔습니다. (" + RANKS[state.rankIdx] + ")");
      updateUI();
      if (typeof startRenderLoop === "function") startRenderLoop();
      return;
    } catch (e) {}
  }
  initPlanet(0);
}

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

  saveGame();
  setLog("[출근 완료] " + p.name + ": " + p.desc);
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
  }, 18);
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
    saveGame();
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
  saveGame();
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
  saveGame();
  if (typeof SFX !== "undefined" && SFX.scrap) SFX.scrap();
  setLog("[설비 철거] " + fac.name + " 해체 완료. (+" + refund + " Cr 환수)");
  updateUI();
}

function openMail() {
  if (typeof SFX !== "undefined") SFX.click();
  state.unreadMail = false;
  saveGame();
  document.getElementById("mail-dot").classList.add("hidden");
  const content = document.getElementById("mail-content");
  const p = PLANETS[state.planetIdx % PLANETS.length];

  let html = '<div class="mail-item"><strong>발신: 본사 인사/관제팀</strong><br>현재 배정 행성: <b>' + p.name + '</b> (' + (state.planetIdx + 1) + '번째 프로젝트)<br>납기일(' + p.deadline + '일) 내 지구 유사율 93% 이상 달성 요망.</div>';

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
  saveGame();
  if (typeof SFX !== "undefined") SFX.win();
  setLog("[퀘스트 보상] " + q.title + " 달성! +" + q.reward + " Cr 입금.");
  openMail();
  updateUI();
}
function nextDay() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  let dailyUpkeep = 0;
  let activeCount = 0;

  const prev = Object.assign({}, state.stats);

  FACILITIES.forEach(function(f) {
    const item = state.owned[f.id];
    if (item && item.count > 0 && item.active) {
      activeCount += item.count;
      dailyUpkeep += f.upkeep * item.count;
      state.stats.temp += (f.effect.temp || 0) * item.count;
      state.stats.press += (f.effect.press || 0) * item.count;
      state.stats.water += (f.effect.water || 0) * item.count;
      state.stats.o2 += (f.effect.o2 || 0) * item.count;
      state.stats.bio += (f.effect.bio || 0) * item.count;
    }
  });

  if (state.stats.temp > 85) state.stats.water = Math.max(0, state.stats.water - 3);
  if (state.stats.temp < -10 || state.stats.press < 15) state.stats.bio = Math.max(0, state.stats.bio - 2);

  state.stats.water = Math.max(0, Math.min(100, state.stats.water));
  state.stats.o2 = Math.max(0, Math.min(100, state.stats.o2));
  state.stats.bio = Math.max(0, Math.min(100, state.stats.bio));
  state.stats.press = Math.max(0, state.stats.press);

  const net = p.dailyGrant - dailyUpkeep;
  state.budget += net;
  const finishedDay = state.day;
  state.day += 1;
  if (typeof SFX !== "undefined") SFX.nextDay();

  // 1. 행성 환경 변화 요약
  let changes = [];
  const dTemp = state.stats.temp - prev.temp;
  const dPress = state.stats.press - prev.press;
  const dWater = state.stats.water - prev.water;
  const dO2 = state.stats.o2 - prev.o2;
  const dBio = state.stats.bio - prev.bio;

  if (dTemp !== 0) changes.push("온도 " + (dTemp > 0 ? "+" : "") + dTemp + "°C");
  if (dPress !== 0) changes.push("기압 " + (dPress > 0 ? "+" : "") + dPress + "kPa");
  if (dWater !== 0) changes.push("수위 " + (dWater > 0 ? "+" : "") + dWater + "%");
  if (dO2 !== 0) changes.push("산소 " + (dO2 > 0 ? "+" : "") + dO2 + "%");
  if (dBio !== 0) changes.push("생태 " + (dBio > 0 ? "+" : "") + dBio + "%");

  const changeHtml = changes.length > 0 ? changes.join(" / ") : "변화 없음 (가동 설비 없음)";

  // 2. 상사 메시지 또는 돌발 이벤트 판정
  let eventHtml = (typeof BOSS_MESSAGES !== "undefined")
    ? "💬 " + BOSS_MESSAGES[Math.floor(Math.random() * BOSS_MESSAGES.length)]
    : "💬 오늘도 수고하셨습니다.";

  const hasClaimable = QUESTS.some(function(q) { return !state.completedQuests.includes(q.id) && q.check(state.stats); });
  if (hasClaimable) {
    state.unreadMail = true;
    eventHtml = "✉ <b>[사내 메일 도착]</b> 단기 퀘스트 목표를 달성했습니다! 우측 상단 메일함에서 성과금을 수령하세요.";
  }

  if (Math.random() < 0.25) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    if (ev.effect && (ev.effect.temp > 0 || ev.effect.bio < 0)) {
      const def = getDefenseRate();
      if (Math.random() * 100 < def) {
        eventHtml = "🛡️ <b>[재해 방어 성공]</b> 대기 및 자기장 방패(방어율 " + def + "%)가 우주 재해를 막아냈습니다!";
      } else {
        eventHtml = "⚠️ <b>" + ev.msg + "</b>";
        state.stats.temp += (ev.effect.temp || 0);
        state.stats.press = Math.max(0, state.stats.press + (ev.effect.press || 0));
        state.stats.bio = Math.max(0, state.stats.bio + (ev.effect.bio || 0));
        if (typeof SFX !== "undefined") SFX.alert();
      }
    } else {
      eventHtml = "🎉 <b>" + ev.msg + "</b>";
      if (ev.budget) state.budget += ev.budget;
    }
  }

  // 파산 / 납기 초과 체크
  if (state.budget < 0) {
    if (typeof SFX !== "undefined") SFX.alert();
    alert("[해고 통보] 프로젝트 예산 파산으로 징계 해고되었습니다!");
    state.rankIdx = 0;
    initPlanet(0);
    return;
  }
  if (state.day > p.deadline) {
    if (typeof SFX !== "undefined") SFX.alert();
    alert("[해고 통보] 본사 납기일을 초과하여 계약이 해지되었습니다!");
    state.rankIdx = 0;
    initPlanet(0);
    return;
  }

  // 정산 팝업 모달 표시
  document.getElementById("report-title").textContent = "[" + finishedDay + "일차 퇴근 정산 보고서]";
  document.getElementById("report-content").innerHTML =
    '<div class="report-section">' +
      '<strong>■ 행성 환경 변화</strong><br>' + changeHtml + '<br>' +
      '현재 지구 유사율: <strong style="color:#00f0ff;">' + calculateESI().toFixed(1) + '%</strong>' +
    '</div>' +
    '<div class="report-section">' +
      '<strong>■ 일일 예산 정산</strong> (가동 설비 ' + activeCount + '기)<br>' +
      '본사 지원금: <span style="color:#33ff77;">+' + p.dailyGrant + ' Cr</span> / 유지비: <span style="color:#ff5555;">-' + dailyUpkeep + ' Cr</span><br>' +
      '순수익: <strong>' + (net >= 0 ? '+' : '') + net + ' Cr</strong> (잔여 예산: ' + state.budget + ' Cr)' +
    '</div>' +
    '<div class="report-boss">' + eventHtml + '</div>';

  document.getElementById("report-modal").classList.remove("hidden");
  setLog(state.day + "일차 근무 개시. (유사율 " + calculateESI().toFixed(1) + "%)");

  saveGame();
  updateUI();
}

function closeReport() {
  if (typeof SFX !== "undefined") SFX.click();
  document.getElementById("report-modal").classList.add("hidden");
}

function completeProject() {
  const esi = calculateESI();
  if (esi < 93) return;

  if (typeof SFX !== "undefined") SFX.win();
  const grade = esi >= 97 ? "S등급 (초과 달성 인센티브)" : "A등급 (정상 완료)";
  const bonus = esi >= 97 ? 350 : 150;
  const prevRank = RANKS[state.rankIdx];
  state.rankIdx = Math.min(RANKS.length - 1, state.rankIdx + 1);
  const nextRank = RANKS[state.rankIdx];

  if (state.planetIdx === PLANETS.length - 1) {
    state.rankIdx = RANKS.length - 1;
    const endScreen = document.getElementById("ending-screen");
    const endSummary = document.getElementById("ending-summary");
    if (endSummary) {
      endSummary.innerHTML =
        "최종 직급: <strong>테라-코프 명예 이사</strong><br>" +
        "완수한 행성: <strong>총 " + PLANETS.length + "개 행성 테라포밍 성공</strong><br>" +
        "최종 프로젝트 평가: <strong>" + grade + " (" + esi.toFixed(1) + "%)</strong><br><br>" +
        "인턴으로 입사해 수없이 많은 야근과 우주 재해를 뚫고 10개의 죽은 행성을 푸른 낙원으로 바꿨습니다. 당신은 이제 전설입니다!";
    }
    if (endScreen) endScreen.classList.remove("hidden");
    initPlanet(state.planetIdx + 1);
    return;
  }

  alert(
    "=== [테라-코프 인사 발령장] ===\n\n" +
    "평가 등급: " + grade + "\n" +
    "최종 유사율: " + esi.toFixed(1) + "%\n" +
    "성과 보너스: +" + bonus + " Cr\n" +
    "직급 변경: " + prevRank + " -> " + nextRank + "\n\n" +
    "다음 개조 행성으로 이동합니다."
  );
  initPlanet(state.planetIdx + 1);
}

function closeEnding() {
  if (typeof SFX !== "undefined") SFX.click();
  const endScreen = document.getElementById("ending-screen");
  if (endScreen) endScreen.classList.add("hidden");
}

function updateUI() {
  const p = PLANETS[state.planetIdx % PLANETS.length];
  document.getElementById("rank-badge").textContent = RANKS[state.rankIdx];
  document.getElementById("planet-name").textContent = p.name;
  document.getElementById("day-counter").textContent = state.day + "일차 (마감 " + p.deadline + "일)";
  document.getElementById("budget-val").textContent = state.budget;
  document.getElementById("shield-status").textContent = "방어율: " + getDefenseRate() + "%";

  const frame = document.getElementById("monitor-frame");
  if (state.budget < 80 || (p.deadline - state.day) <= 5) {
    frame.classList.add("danger-alert");
  } else {
    frame.classList.remove("danger-alert");
  }

  const dotEl = document.getElementById("mail-dot");
  if (state.unreadMail) dotEl.classList.remove("hidden");
  else dotEl.classList.add("hidden");

  let upkeep = 0;
  FACILITIES.forEach(function(f) {
    if (state.owned[f.id] && state.owned[f.id].active) upkeep += f.upkeep * state.owned[f.id].count;
  });
  const net = p.dailyGrant - upkeep;
  const netEl = document.getElementById("net-income");
  netEl.textContent = (net >= 0 ? "+" : "") + net;
  netEl.style.color = net >= 0 ? "#33ff77" : "#ff5555";

  const s = state.stats;
  document.getElementById("val-temp").textContent = s.temp + "°C";
  document.getElementById("bar-temp").style.width = Math.max(0, Math.min(100, (s.temp + 85) / 2)) + "%";

  document.getElementById("val-press").textContent = s.press + "kPa";
  document.getElementById("bar-press").style.width = Math.max(0, Math.min(100, s.press / 2)) + "%";

  document.getElementById("val-water").textContent = s.water + "%";
  document.getElementById("bar-water").style.width = s.water + "%";

  document.getElementById("val-o2").textContent = s.o2 + "%";
  document.getElementById("bar-o2").style.width = Math.min(100, s.o2 * 2.5) + "%";

  document.getElementById("val-bio").textContent = s.bio + "%";
  document.getElementById("bar-bio").style.width = s.bio + "%";

  const esi = calculateESI();
  document.getElementById("esi-val").textContent = esi.toFixed(1);
  const compBtn = document.getElementById("complete-btn");
  if (esi >= 93) compBtn.classList.remove("hidden");
  else compBtn.classList.add("hidden");

  const listEl = document.getElementById("facility-list");
  listEl.innerHTML = "";
  FACILITIES.forEach(function(f) {
    const owned = state.owned[f.id] || { count: 0, active: true };
    const isLocked = state.rankIdx < f.unlockRank;
    const card = document.createElement("div");
    card.className = "fac-card" + (isLocked ? " locked" : "");

    if (isLocked) {
      card.innerHTML = '<div class="fac-header"><span>🔒 ' + f.name + '</span></div><div style="color:#ffcc00; font-size:10px;">[' + RANKS[f.unlockRank] + '] 승진 시 해금</div>';
    } else {
      card.innerHTML =
        '<div class="fac-header"><span>' + f.name + ' (' + owned.count + ')</span><span>' + f.cost + 'Cr</span></div>' +
        '<div style="color:#88ccaa; font-size:10px;">' + f.desc + ' (유지-' + f.upkeep + ')</div>' +
        '<div class="fac-btns">' +
        '<button onclick="buildFacility(\'' + f.id + '\')">건설</button>' +
        '<button class="' + (owned.active ? '' : 'off') + '" onclick="toggleFacility(\'' + f.id + '\')">' +
        (owned.count === 0 ? '-' : (owned.active ? 'ON' : 'OFF')) +
        '</button>' +
        '<button onclick="scrapFacility(\'' + f.id + '\')" style="color:#ffcc00; border-color:#ffcc00;">철거</button>' +
        '</div>';
    }
    listEl.appendChild(card);
  });
if (typeof drawPlanet === "function") drawPlanet(state.stats);
if (typeof drawRadar === "function") drawRadar(state.stats);
}

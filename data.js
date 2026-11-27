const RANKS = ["인턴", "사원", "대리", "과장", "차장", "부장", "이사"];

const EARTH_TARGET = {
  temp: 15,
  press: 101,
  water: 70,
  o2: 21,
  bio: 80
};

const PLANETS = [
  { name: "P-01 아레스-미니", desc: "온화한 소행성. 기초 장비로 93%를 달성하세요.", deadline: 35, dailyGrant: 65, startBudget: 420, stats: { temp: -35, press: 20, water: 10, o2: 2, bio: 0 } },
  { name: "P-02 크리오스", desc: "혹한의 얼음 위성. 온도와 기압 상승이 시급합니다.", deadline: 40, dailyGrant: 85, startBudget: 520, stats: { temp: -70, press: 15, water: 15, o2: 0, bio: 0 } },
  { name: "P-03 아쿠아리아", desc: "행성 전체가 바다인 해양 행성. 증발기로 육지를 확보하세요.", deadline: 40, dailyGrant: 95, startBudget: 580, stats: { temp: 10, press: 110, water: 98, o2: 8, bio: 10 } },
  { name: "P-04 사하라-IX", desc: "메마른 붉은 사막 행성. 혜성과 빙하 시추로 물을 채우세요.", deadline: 42, dailyGrant: 105, startBudget: 620, stats: { temp: 55, press: 45, water: 0, o2: 1, bio: 0 } },
  { name: "P-05 베누스-X", desc: "초고온·초고압 지옥 행성. 냉각과 대기 제거가 핵심입니다.", deadline: 45, dailyGrant: 125, startBudget: 720, stats: { temp: 130, press: 205, water: 0, o2: 0, bio: 0 } },
  { name: "P-06 타이탄-스모그", desc: "짙은 메탄 안개 행성. 과잉 기압을 빼고 산소를 채우세요.", deadline: 45, dailyGrant: 135, startBudget: 760, stats: { temp: -45, press: 185, water: 30, o2: 0, bio: 5 } },
  { name: "P-07 헬리오스-IV", desc: "태양풍이 몰아치는 방사선 행성. 자기장 방패가 필수입니다.", deadline: 48, dailyGrant: 150, startBudget: 850, stats: { temp: 75, press: 10, water: 5, o2: 0, bio: 0 } },
  { name: "P-08 에덴-오버그로스", desc: "식물이 폭주한 원시 밀림 행성. 과잉 산소와 생태계를 조절하세요.", deadline: 48, dailyGrant: 160, startBudget: 900, stats: { temp: 32, press: 135, water: 85, o2: 38, bio: 100 } },
  { name: "P-09 글라시우스-코어", desc: "절대영도에 가까운 외곽 행성. 거대 반사 거울이 필요합니다.", deadline: 52, dailyGrant: 180, startBudget: 1000, stats: { temp: -85, press: 5, water: 0, o2: 0, bio: 0 } },
  { name: "P-10 오메가-프라임", desc: "최종 승진 심사 행성! 모든 극한 환경을 극복하고 이사로 승진하세요.", deadline: 55, dailyGrant: 210, startBudget: 1200, stats: { temp: 145, press: 220, water: 95, o2: 0, bio: 0 } }
];

const FACILITIES = [
  { id: "heater", name: "열핵 히터", unlockRank: 0, cost: 85, upkeep: 7, desc: "온도 +4°C, 수위 -1%", effect: { temp: 4, press: 0, water: -1, o2: 0, bio: 0, shield: 0 } },
  { id: "cryo_vent", name: "극저온 냉각탑", unlockRank: 0, cost: 90, upkeep: 8, desc: "온도 -4°C, 기압 -1", effect: { temp: -4, press: -1, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "pressurizer", name: "가스 방출기", unlockRank: 0, cost: 95, upkeep: 8, desc: "기압 +6kPa, 온도 +1", effect: { temp: 1, press: 6, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "vac_pump", name: "대기 진공 펌프", unlockRank: 0, cost: 100, upkeep: 8, desc: "기압 -6kPa, 온도 -1", effect: { temp: -1, press: -6, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "comet", name: "얼음 혜성 유도", unlockRank: 0, cost: 130, upkeep: 7, desc: "수위 +5%, 온도 -1", effect: { temp: -1, press: 2, water: 5, o2: 0, bio: 0, shield: 0 } },
  { id: "evaporator", name: "초고열 증발기", unlockRank: 0, cost: 110, upkeep: 8, desc: "수위 -5%, 기압 +3", effect: { temp: 2, press: 3, water: -5, o2: 0, bio: 0, shield: 0 } },
  { id: "moss", name: "이끼 살포기", unlockRank: 0, cost: 115, upkeep: 9, desc: "생태 +4%, 산소 +1%", effect: { temp: 0, press: 0, water: 0, o2: 1, bio: 4, shield: 0 } },
  { id: "carbon_burner", name: "탄소 연소로", unlockRank: 0, cost: 105, upkeep: 7, desc: "산소 -3%, 온도 +5°C", effect: { temp: 5, press: 2, water: 0, o2: -3, bio: -1, shield: 0 } },

  { id: "orbital_mirror", name: "궤도 반사 거울", unlockRank: 1, cost: 150, upkeep: 11, desc: "온도 +8°C, 수위 -2%", effect: { temp: 8, press: 0, water: -2, o2: 0, bio: 0, shield: 0 } },
  { id: "cooler", name: "궤도 차양막", unlockRank: 1, cost: 150, upkeep: 11, desc: "온도 -8°C, 생태 -1%", effect: { temp: -8, press: 0, water: 0, o2: 0, bio: -1, shield: 0 } },
  { id: "algae_tank", name: "조류 산소 배양소", unlockRank: 1, cost: 145, upkeep: 11, desc: "산소 +4%, 수위 -2%", effect: { temp: 0, press: 0, water: -2, o2: 4, bio: 1, shield: 0 } },
  { id: "forest", name: "유전자 숲 플랜트", unlockRank: 1, cost: 185, upkeep: 15, desc: "생태 +7%, 산소 +3%", effect: { temp: 0, press: 0, water: -1, o2: 3, bio: 7, shield: 0 } },

  { id: "atmo_stripper", name: "대기 제거 플랜트", unlockRank: 2, cost: 210, upkeep: 16, desc: "기압 -14kPa, 온도 -2", effect: { temp: -2, press: -14, water: 0, o2: -1, bio: 0, shield: 0 } },
  { id: "bio_harvester", name: "생태 자원 추출기", unlockRank: 2, cost: 180, upkeep: 5, desc: "생태 -6%, 기압 -4kPa", effect: { temp: 0, press: -4, water: -2, o2: -2, bio: -6, shield: 0 } },
  { id: "mag_shield", name: "인공 자기장 방패", unlockRank: 2, cost: 240, upkeep: 18, desc: "방어 +35%, 기압 +1", effect: { temp: 0, press: 1, water: 0, o2: 0, bio: 0, shield: 35 } },
  { id: "bio_dome", name: "초거대 생태계 돔", unlockRank: 3, cost: 300, upkeep: 22, desc: "생태 +12%, 산소 +5%", effect: { temp: 1, press: 2, water: 0, o2: 5, bio: 12, shield: 10 } }
];

const QUESTS = [
  { id: "q_temp", title: "[긴급 지시] 적정 온도권 진입", desc: "행성 표면 온도를 0°C ~ 30°C 사이로 맞추십시오.", reward: 180, check: function(s) { return s.temp >= 0 && s.temp <= 30; } },
  { id: "q_water", title: "[연구 과제] 균형 잡힌 해양", desc: "수위를 50% ~ 85% 범위 내로 확보하십시오.", reward: 220, check: function(s) { return s.water >= 50 && s.water <= 85; } },
  { id: "q_o2", title: "[환경 평가] 호흡 가능 대기", desc: "산소 농도를 16% 이상으로 끌어올리십시오.", reward: 260, check: function(s) { return s.o2 >= 16; } }
];

const BOSS_MESSAGES = [
  "팀장: '자네, 야근 수당은 없지만 우주 평화를 위해 힘내게.'",
  "본부장: '주주총회가 코앞이야. 지표 그래프 예쁘게 만들어 놔!'",
  "인사팀: '설비 전기세 좀 아껴 쓰세요. 본사 예산도 빠듯합니다.'",
  "과장: '오늘 회식인데... 아, 자네는 원격 근무지? 수고하게!'",
  "감사팀: '불필요하게 켜둔 기계는 끄고 다니는 습관을 들입시다.'",
  "연구소장: '지구와 너무 똑같으면 오히려 예술성이 떨어지지 않나? 농담일세.'",
  "사내 공지: '금일 구내식당 특식은 합성 단백질 스테이크입니다.'",
  "팀장: '숫자 하나 틀어지면 행성 하나 날아가는 거야. 정신 바짝 차려!'"
];

const RANDOM_EVENTS = [
  { msg: "[재해] 태양풍 강타! 온도 +6°C 상승, 기압 -4kPa 손실.", effect: { temp: 6, press: -4, water: 0, bio: 0 } },
  { msg: "[보너스] 본사 분기 우수 부서 선정! 특별 예산 +130 Cr 지급.", budget: 130 },
  { msg: "[재해] 소행성 충돌! 기압 +5kPa, 생태 -4% 피해 발생.", effect: { temp: 2, press: 5, water: 0, bio: -4 } },
  { msg: "[지원] 본사 R&D 지원금 도착! 예산 +90 Cr 추가 배정.", budget: 90 }
];

const RANKS = ["인턴", "사원", "대리", "과장", "팀장", "부장"];

const EARTH_TARGET = {
  temp: 15,
  press: 101,
  water: 70,
  o2: 21,
  bio: 80
};

const PLANETS = [
  {
    name: "P-01 아레스-미니",
    desc: "온화한 소행성. 기초 장비로 목표 95%를 달성하세요.",
    deadline: 35,
    dailyGrant: 65,
    startBudget: 420,
    stats: { temp: -35, press: 20, water: 10, o2: 2, bio: 0 }
  },
  {
    name: "P-02 크리오스",
    desc: "혹한의 얼음 위성. 온도와 기압 상승이 시급합니다.",
    deadline: 40,
    dailyGrant: 85,
    startBudget: 520,
    stats: { temp: -75, press: 10, water: 5, o2: 0, bio: 0 }
  },
  {
    name: "P-03 베누스-X",
    desc: "초고온·초고압 지옥 행성. 냉각과 대기 제거가 핵심입니다.",
    deadline: 45,
    dailyGrant: 125,
    startBudget: 720,
    stats: { temp: 135, press: 210, water: 0, o2: 0, bio: 0 }
  },
  {
    name: "P-04 헬리오스-IV",
    desc: "태양풍이 몰아치는 방사선 행성. 자기장 방패가 필수입니다.",
    deadline: 50,
    dailyGrant: 155,
    startBudget: 880,
    stats: { temp: 65, press: 5, water: 0, o2: 0, bio: 0 }
  }
];

const FACILITIES = [
  { id: "heater", name: "열핵 히터", unlockRank: 0, cost: 85, upkeep: 7, desc: "온도 +4°C", effect: { temp: 4, press: 0, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "cryo_vent", name: "극저온 냉각탑", unlockRank: 0, cost: 90, upkeep: 8, desc: "온도 -4°C", effect: { temp: -4, press: 0, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "pressurizer", name: "가스 방출기", unlockRank: 0, cost: 95, upkeep: 8, desc: "기압 +6kPa, 온도 +1", effect: { temp: 1, press: 6, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "comet", name: "얼음 혜성 유도", unlockRank: 0, cost: 135, upkeep: 7, desc: "수위 +5%, 기압 +2", effect: { temp: -1, press: 2, water: 5, o2: 0, bio: 0, shield: 0 } },
  { id: "moss", name: "이끼 살포기", unlockRank: 0, cost: 115, upkeep: 9, desc: "생태 +4%, 산소 +1%", effect: { temp: 0, press: 0, water: 0, o2: 1, bio: 4, shield: 0 } },
  { id: "algae_tank", name: "조류 산소 배양소", unlockRank: 0, cost: 130, upkeep: 10, desc: "산소 +3%, 수위 -1%", effect: { temp: 0, press: 0, water: -1, o2: 3, bio: 1, shield: 0 } },

  { id: "orbital_mirror", name: "궤도 반사 거울", unlockRank: 1, cost: 150, upkeep: 11, desc: "온도 +8°C, 수위 -1%", effect: { temp: 8, press: 0, water: -1, o2: 0, bio: 0, shield: 0 } },
  { id: "cooler", name: "궤도 차양막", unlockRank: 1, cost: 150, upkeep: 11, desc: "온도 -8°C", effect: { temp: -8, press: 0, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "ice_drill", name: "지하 빙하 시추기", unlockRank: 1, cost: 165, upkeep: 12, desc: "수위 +8%, 온도 -1", effect: { temp: -1, press: 0, water: 8, o2: 0, bio: 0, shield: 0 } },
  { id: "forest", name: "유전자 숲 플랜트", unlockRank: 1, cost: 185, upkeep: 15, desc: "생태 +7%, 산소 +3%", effect: { temp: 0, press: 0, water: -1, o2: 3, bio: 7, shield: 0 } },

  { id: "atmo_stripper", name: "대기 제거 플랜트", unlockRank: 2, cost: 210, upkeep: 16, desc: "기압 -12kPa, 온도 -2", effect: { temp: -2, press: -12, water: 0, o2: 0, bio: 0, shield: 0 } },
  { id: "soil_microbe", name: "독성 분해 미생물", unlockRank: 2, cost: 200, upkeep: 14, desc: "생태 +10%, 기압 +2", effect: { temp: 0, press: 2, water: 0, o2: 1, bio: 10, shield: 0 } },
  { id: "mag_shield", name: "인공 자기장 방패", unlockRank: 2, cost: 240, upkeep: 18, desc: "방어 +35%, 기압 +1", effect: { temp: 0, press: 1, water: 0, o2: 0, bio: 0, shield: 35 } },
  { id: "bio_dome", name: "초거대 생태계 돔", unlockRank: 3, cost: 300, upkeep: 22, desc: "생태 +12%, 산소 +5%", effect: { temp: 1, press: 2, water: 0, o2: 5, bio: 12, shield: 10 } }
];

const QUESTS = [
  { id: "q_temp", title: "[긴급 지시] 초기 온난화 달성", desc: "행성 표면 온도를 0°C 이상으로 올리십시오.", reward: 180, check: function(s) { return s.temp >= 0; } },
  { id: "q_water", title: "[연구 과제] 액체 바다 형성", desc: "수위를 40% 이상 확보하십시오.", reward: 220, check: function(s) { return s.water >= 40; } },
  { id: "q_o2", title: "[환경 평가] 호흡 가능 대기", desc: "산소 농도를 15% 이상으로 끌어올리십시오.", reward: 260, check: function(s) { return s.o2 >= 15; } }
];

const RANDOM_EVENTS = [
  { msg: "[재해] 태양풍 강타! 온도 +6°C 상승, 기압 -4kPa 손실.", effect: { temp: 6, press: -4, water: 0, bio: 0 } },
  { msg: "[보너스] 본사 분기 우수 부서 선정! 특별 예산 +120 Cr 지급.", budget: 120 },
  { msg: "[재해] 운석 충돌! 기압 +4kPa, 생태 -4% 피해 발생.", effect: { temp: 2, press: 4, water: 0, bio: -4 } },
  { msg: "[메신저] 팀장님: '자네, 야근 수당은 없으니 납기일 꼭 맞추게.'", budget: 0 }
];

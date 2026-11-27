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
    desc: "온화한 소행성. 기초 장비로 충분합니다.",
    deadline: 35,
    dailyGrant: 65,
    startBudget: 400,
    stats: { temp: -35, press: 20, water: 10, o2: 2, bio: 0 }
  },
  {
    name: "P-02 크리오스",
    desc: "혹한의 얼음 위성. 온도와 기압 상승이 시급합니다.",
    deadline: 40,
    dailyGrant: 85,
    startBudget: 500,
    stats: { temp: -75, press: 10, water: 5, o2: 0, bio: 0 }
  },
  {
    name: "P-03 베누스-X",
    desc: "초고온·초고압 지옥 행성. 냉각과 대기 제거가 핵심입니다.",
    deadline: 45,
    dailyGrant: 120,
    startBudget: 700,
    stats: { temp: 135, press: 210, water: 0, o2: 0, bio: 0 }
  },
  {
    name: "P-04 헬리오스-IV",
    desc: "태양풍이 몰아치는 방사선 행성. 자기장 방패가 필수입니다.",
    deadline: 50,
    dailyGrant: 150,
    startBudget: 850,
    stats: { temp: 65, press: 5, water: 0, o2: 0, bio: 0 }
  }
];

const FACILITIES = [
  {
    id: "heater",
    name: "열핵 히터",
    unlockRank: 0,
    cost: 90,
    upkeep: 8,
    desc: "온도 +4°C",
    effect: { temp: 4, press: 0, water: 0, o2: 0, bio: 0, shield: 0 }
  },
  {
    id: "pressurizer",
    name: "가스 방출기",
    unlockRank: 0,
    cost: 100,
    upkeep: 9,
    desc: "기압 +6kPa, 온도 +1",
    effect: { temp: 1, press: 6, water: 0, o2: 0, bio: 0, shield: 0 }
  },
  {
    id: "comet",
    name: "얼음 혜성 유도",
    unlockRank: 0,
    cost: 140,
    upkeep: 8,
    desc: "수위 +5%, 기압 +2",
    effect: { temp: -1, press: 2, water: 5, o2: 0, bio: 0, shield: 0 }
  },
  {
    id: "moss",
    name: "이끼 살포기",
    unlockRank: 0,
    cost: 120,
    upkeep: 10,
    desc: "생태 +4%, 산소 +1%",
    effect: { temp: 0, press: 0, water: 0, o2: 1, bio: 4, shield: 0 }
  },
  {
    id: "cooler",
    name: "궤도 차양막",
    unlockRank: 1, // 사원 해금
    cost: 130,
    upkeep: 11,
    desc: "온도 -6°C",
    effect: { temp: -6, press: 0, water: 0, o2: 0, bio: 0, shield: 0 }
  },
  {
    id: "forest",
    name: "유전자 숲 플랜트",
    unlockRank: 1, // 사원 해금
    cost: 190,
    upkeep: 16,
    desc: "생태 +6%, 산소 +3%",
    effect: { temp: 0, press: 0, water: -1, o2: 3, bio: 6, shield: 0 }
  },
  {
    id: "atmo_stripper",
    name: "대기 제거 플랜트",
    unlockRank: 2, // 대리 해금
    cost: 220,
    upkeep: 18,
    desc: "기압 -10kPa, 온도 -2",
    effect: { temp: -2, press: -10, water: 0, o2: 0, bio: 0, shield: 0 }
  },
  {
    id: "mag_shield",
    name: "인공 자기장 방패",
    unlockRank: 2, // 대리 해금
    cost: 250,
    upkeep: 20,
    desc: "재해 방어 +35%, 기압 보존",
    effect: { temp: 0, press: 1, water: 0, o2: 0, bio: 0, shield: 35 }
  }
];

const QUESTS = [
  {
    id: "q_temp",
    title: "[긴급 지시] 초기 온난화 달성",
    desc: "상부에서 행성 표면 온도를 0°C 이상으로 올리길 원합니다.",
    reward: 180,
    check: (s) => s.temp >= 0
  },
  {
    id: "q_water",
    title: "[연구 과제] 액체 바다 형성",
    desc: "수위를 40% 이상 확보하여 해양 생태계 기반을 마련하십시오.",
    reward: 220,
    check: (s) => s.water >= 40
  },
  {
    id: "q_o2",
    title: "[환경 평가] 호흡 가능 대기",
    desc: "산소 농도를 15% 이상으로 끌어올려 시찰단 방문에 대비하십시오.",
    reward: 260,
    check: (s) => s.o2 >= 15
  }
];

const RANDOM_EVENTS = [
  { msg: "[재해] 태양풍 강타! 온도 +6°C 상승, 기압 -4kPa 손실.", effect: { temp: 6, press: -4, water: 0, bio: 0 } },
  { msg: "[보너스] 본사 분기 우수 부서 선정! 특별 예산 +120 Cr 지급.", budget: 120 },
  { msg: "[재해] 운석 충돌! 기압 +4kPa, 생태 -4% 피해 발생.", effect: { temp: 2, press: 4, water: 0, bio: -4 } },
  { msg: "[메신저] 팀장님: '자네, 야근 수당은 없으니 납기일 꼭 맞추게.'" , budget: 0 }
];

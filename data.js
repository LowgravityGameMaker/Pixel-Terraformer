
const RANKS = ["인턴", "사원", "대리", "과장", "팀장", "부장"];

// 지구 기준 목표치 (temp: °C, press: kPa, water: %, o2: %, bio: %)
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
    deadline: 35,
    dailyGrant: 60,
    startBudget: 400,
    stats: { temp: -35, press: 20, water: 10, o2: 2, bio: 0 }
  },
  {
    name: "P-02 크리오스",
    deadline: 40,
    dailyGrant: 80,
    startBudget: 500,
    stats: { temp: -70, press: 10, water: 5, o2: 0, bio: 0 }
  },
  {
    name: "P-03 베누스-X",
    deadline: 45,
    dailyGrant: 110,
    startBudget: 650,
    stats: { temp: 140, press: 220, water: 0, o2: 0, bio: 0 }
  }
];

const FACILITIES = [
  {
    id: "heater",
    name: "열핵 히터",
    cost: 100,
    upkeep: 10,
    desc: "온도 +4°C",
    effect: { temp: 4, press: 0, water: 0, o2: 0, bio: 0 }
  },
  {
    id: "cooler",
    name: "궤도 차양막",
    cost: 120,
    upkeep: 12,
    desc: "온도 -5°C",
    effect: { temp: -5, press: 0, water: 0, o2: 0, bio: 0 }
  },
  {
    id: "pressurizer",
    name: "가스 방출기",
    cost: 110,
    upkeep: 10,
    desc: "기압 +6kPa, 온도 +1",
    effect: { temp: 1, press: 6, water: 0, o2: 0, bio: 0 }
  },
  {
    id: "comet",
    name: "얼음 혜성 유도",
    cost: 150,
    upkeep: 8,
    desc: "수위 +5%, 기압 +2",
    effect: { temp: -1, press: 2, water: 5, o2: 0, bio: 0 }
  },
  {
    id: "moss",
    name: "이끼 살포기",
    cost: 130,
    upkeep: 12,
    desc: "생태 +4%, 산소 +1%",
    effect: { temp: 0, press: 0, water: 0, o2: 1, bio: 4 }
  },
  {
    id: "forest",
    name: "유전자 숲 플랜트",
    cost: 200,
    upkeep: 18,
    desc: "생태 +6%, 산소 +3%",
    effect: { temp: 0, press: 0, water: -1, o2: 3, bio: 6 }
  }
];

const RANDOM_EVENTS = [
  { msg: "[돌발] 태양풍 강타! 온도 +5°C 상승, 기압 -3kPa 손실.", effect: { temp: 5, press: -3, water: 0, o2: 0, bio: 0 } },
  { msg: "[보너스] 본사 분기 우수 부서 선정! 특별 예산 +120 Cr 지급.", budget: 120 },
  { msg: "[재해] 소규모 운석 충돌! 기압 +4kPa, 생태 -3% 피해.", effect: { temp: 2, press: 4, water: 0, o2: 0, bio: -3 } },
  { msg: "[지시] 본사 감사팀 방문. 유지비 절감을 권장합니다.", budget: 0 }
];

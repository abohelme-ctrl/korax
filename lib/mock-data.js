// Mock data for development — replace with API-Football calls in production

export const WC_LEAGUE_ID = 1
export const WC_SEASON = 2026

// ─── Teams ────────────────────────────────────────────────────────────────────

// فرق كأس العالم 2026 الحقيقية
export const TEAMS = {
  // المجموعة A
  MEX: { id: '16',   name: 'المكسيك',              flag: '🇲🇽', color: '#006847' },
  RSA: { id: '1531', name: 'جنوب أفريقيا',          flag: '🇿🇦', color: '#007A4D' },
  KOR: { id: '17',   name: 'كوريا الجنوبية',        flag: '🇰🇷', color: '#003478' },
  CZE: { id: '770',  name: 'التشيك',                flag: '🇨🇿', color: '#D7141A' },
  // المجموعة B
  CAN: { id: '5529', name: 'كندا',                  flag: '🇨🇦', color: '#FF0000' },
  BIH: { id: '1113', name: 'البوسنة والهرسك',       flag: '🇧🇦', color: '#002395' },
  QAT: { id: '1569', name: 'قطر',                   flag: '🇶🇦', color: '#8D1B3D' },
  SUI: { id: '15',   name: 'سويسرا',                flag: '🇨🇭', color: '#FF0000' },
  // المجموعة C
  BRA: { id: '6',    name: 'البرازيل',              flag: '🇧🇷', color: '#009C3B' },
  MAR: { id: '31',   name: 'المغرب',                flag: '🇲🇦', color: '#C1272D' },
  HAI: { id: '2386', name: 'هايتي',                 flag: '🇭🇹', color: '#00209F' },
  SCO: { id: '1108', name: 'اسكتلندا',              flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003DA5' },
  // المجموعة D
  USA: { id: '2384', name: 'الولايات المتحدة',      flag: '🇺🇸', color: '#0A3161' },
  PAR: { id: '2380', name: 'باراغواي',              flag: '🇵🇾', color: '#D52B1E' },
  AUS: { id: '20',   name: 'أستراليا',              flag: '🇦🇺', color: '#00843D' },
  TUR: { id: '777',  name: 'تركيا',                 flag: '🇹🇷', color: '#E30A17' },
  // المجموعة E
  GER: { id: '25',   name: 'ألمانيا',               flag: '🇩🇪', color: '#000000' },
  CUW: { id: '5530', name: 'كوراساو',               flag: '🇨🇼', color: '#003DA5' },
  CIV: { id: '1501', name: 'ساحل العاج',            flag: '🇨🇮', color: '#F77F00' },
  ECU: { id: '2382', name: 'الإكوادور',             flag: '🇪🇨', color: '#FFD100' },
  // المجموعة F
  NED: { id: '1118', name: 'هولندا',                flag: '🇳🇱', color: '#FF4F00' },
  JPN: { id: '12',   name: 'اليابان',               flag: '🇯🇵', color: '#BC002D' },
  SWE: { id: '5',    name: 'السويد',                flag: '🇸🇪', color: '#006AA7' },
  TUN: { id: '28',   name: 'تونس',                  flag: '🇹🇳', color: '#E70013' },
  // المجموعة G
  BEL: { id: '1',    name: 'بلجيكا',               flag: '🇧🇪', color: '#000000' },
  EGY: { id: '32',   name: 'مصر',                  flag: '🇪🇬', color: '#CC0000' },
  IRN: { id: '22',   name: 'إيران',                 flag: '🇮🇷', color: '#239F40' },
  NZL: { id: '4673', name: 'نيوزيلندا',             flag: '🇳🇿', color: '#00247D' },
  // المجموعة H
  ESP: { id: '9',    name: 'إسبانيا',               flag: '🇪🇸', color: '#AA151B' },
  CPV: { id: '1533', name: 'الرأس الأخضر',          flag: '🇨🇻', color: '#003893' },
  SAU: { id: '23',   name: 'السعودية',              flag: '🇸🇦', color: '#006C35' },
  URU: { id: '7',    name: 'أوروغواي',              flag: '🇺🇾', color: '#75AADB' },
  // المجموعة I
  FRA: { id: '2',    name: 'فرنسا',                 flag: '🇫🇷', color: '#002395' },
  SEN: { id: '13',   name: 'السنغال',               flag: '🇸🇳', color: '#00853F' },
  IRQ: { id: '1567', name: 'العراق',                flag: '🇮🇶', color: '#CE1126' },
  NOR: { id: '1090', name: 'النرويج',               flag: '🇳🇴', color: '#EF2B2D' },
  // المجموعة J
  ARG: { id: '26',   name: 'الأرجنتين',             flag: '🇦🇷', color: '#74ACDF' },
  ALG: { id: '1532', name: 'الجزائر',               flag: '🇩🇿', color: '#006233' },
  AUT: { id: '775',  name: 'النمسا',                flag: '🇦🇹', color: '#ED2939' },
  JOR: { id: '1548', name: 'الأردن',                flag: '🇯🇴', color: '#007A3D' },
  // المجموعة K
  POR: { id: '27',   name: 'البرتغال',              flag: '🇵🇹', color: '#006600' },
  COD: { id: '1508', name: 'الكونغو الديمقراطية',   flag: '🇨🇩', color: '#007FFF' },
  UZB: { id: '1568', name: 'أوزبكستان',             flag: '🇺🇿', color: '#1EB53A' },
  COL: { id: '8',    name: 'كولومبيا',              flag: '🇨🇴', color: '#FCD116' },
  // المجموعة L
  ENG: { id: '10',   name: 'إنجلترا',               flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF' },
  CRO: { id: '3',    name: 'كرواتيا',               flag: '🇭🇷', color: '#FF0000' },
  GHA: { id: '1504', name: 'غانا',                  flag: '🇬🇭', color: '#006B3F' },
  PAN: { id: '11',   name: 'بنما',                  flag: '🇵🇦', color: '#DA121A' },
}

// ─── WC 2026 Groups ───────────────────────────────────────────────────────────

// مجموعات كأس العالم 2026 الحقيقية
export const GROUPS = [
  { id: 'A', name: 'المجموعة A', teams: [
    { team: TEAMS.MEX, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.RSA, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.KOR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.CZE, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'B', name: 'المجموعة B', teams: [
    { team: TEAMS.CAN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.BIH, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.QAT, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.SUI, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'C', name: 'المجموعة C', teams: [
    { team: TEAMS.BRA, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.MAR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.HAI, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.SCO, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'D', name: 'المجموعة D', teams: [
    { team: TEAMS.USA, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.PAR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.AUS, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.TUR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'E', name: 'المجموعة E', teams: [
    { team: TEAMS.GER, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.CUW, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.CIV, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.ECU, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'F', name: 'المجموعة F', teams: [
    { team: TEAMS.NED, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.JPN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.SWE, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.TUN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'G', name: 'المجموعة G', teams: [
    { team: TEAMS.BEL, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.EGY, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.IRN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.NZL, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'H', name: 'المجموعة H', teams: [
    { team: TEAMS.ESP, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.CPV, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.SAU, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.URU, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'I', name: 'المجموعة I', teams: [
    { team: TEAMS.FRA, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.SEN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.IRQ, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.NOR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'J', name: 'المجموعة J', teams: [
    { team: TEAMS.ARG, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.ALG, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.AUT, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.JOR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'K', name: 'المجموعة K', teams: [
    { team: TEAMS.POR, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.COD, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.UZB, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.COL, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
  { id: 'L', name: 'المجموعة L', teams: [
    { team: TEAMS.ENG, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.CRO, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.GHA, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    { team: TEAMS.PAN, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
  ]},
]

// ─── Mock Matches ─────────────────────────────────────────────────────────────

export const MOCK_MATCHES = [
  {
    id: 'm1',
    status: 'LIVE',
    minute: '67',
    homeTeam: TEAMS.BRA,
    awayTeam: TEAMS.SRB,
    homeScore: 2,
    awayScore: 1,
    group: 'المجموعة C',
    venue: 'SoFi Stadium',
    city: 'لوس أنجلوس',
    stadium: { name: 'SoFi Stadium', city: 'لوس أنجلوس', capacity: 70240, info: 'أكبر ملعب مكشوف في الولايات المتحدة' },
    referee: 'Szymon Marciniak',
    startTime: '2026-06-15T19:00:00Z',
    events: [
      { minute: '23', type: 'goal',        team: 'BRA', player: 'فينيسيوس جونيور', assist: 'رودريغو' },
      { minute: '35', type: 'yellow_card', team: 'SRB', player: 'ميلينكوفيتش-سافيتش', assist: null },
      { minute: '55', type: 'goal',        team: 'BRA', player: 'رودريغو',           assist: 'فينيسيوس' },
      { minute: '61', type: 'goal',        team: 'SRB', player: 'ميتروفيتش',         assist: 'تاديتش' },
      { minute: '63', type: 'subst',       team: 'BRA', player: 'لوكاس باكيتا ← إندريك', assist: null },
    ],
    stats: {
      possession: [58, 42],
      shots: [14, 7],
      shotsOnTarget: [6, 3],
      corners: [5, 2],
      fouls: [9, 13],
    },
    lineups: {
      home: ['أليسون', 'دانيلو', 'ميليتاو', 'ماركينيوس', 'غابريل ماغالهايس', 'كاسيميرو', 'لوكاس باكيتا', 'رافينيا', 'رودريغو', 'فينيسيوس', 'إندريك'],
      away: ['فانياك', 'إيفانوفيتش', 'ميلينكوفيتش', 'بابيتش', 'لازوفيتش', 'لوكيتش', 'تاديتش', 'ميليفوييفيتش', 'كوستيتش', 'فلاهوفيتش', 'ميتروفيتش'],
    },
  },
  {
    id: 'm2',
    status: 'UPCOMING',
    minute: null,
    homeTeam: TEAMS.ARG,
    awayTeam: TEAMS.FRA,
    homeScore: null,
    awayScore: null,
    group: 'المجموعة A',
    venue: 'MetLife Stadium',
    city: 'نيوجيرسي',
    stadium: { name: 'MetLife Stadium', city: 'نيوجيرسي', capacity: 82500, info: 'يستضيف نهائي كأس العالم 2026' },
    referee: 'Daniele Orsato',
    startTime: '2026-06-15T21:00:00Z',
    events: [],
    stats: null,
    lineups: { home: [], away: [] },
  },
  {
    id: 'm3',
    status: 'UPCOMING',
    minute: null,
    homeTeam: TEAMS.ESP,
    awayTeam: TEAMS.GER,
    homeScore: null,
    awayScore: null,
    group: 'المجموعة D',
    venue: 'Allegiant Stadium',
    city: 'لاس فيغاس',
    stadium: { name: 'Allegiant Stadium', city: 'لاس فيغاس', capacity: 65000, info: 'الملعب المسقوف الوحيد في البطولة' },
    referee: 'Anthony Taylor',
    startTime: '2026-06-15T23:00:00Z',
    events: [],
    stats: null,
    lineups: { home: [], away: [] },
  },
  {
    id: 'm4',
    status: 'FINISHED',
    minute: '90',
    homeTeam: TEAMS.MAR,
    awayTeam: TEAMS.BEL,
    homeScore: 2,
    awayScore: 1,
    group: 'المجموعة F',
    venue: 'AT&T Stadium',
    city: 'دالاس',
    stadium: { name: 'AT&T Stadium', city: 'دالاس', capacity: 80000, info: 'أحد أكبر الملاعب المسقوفة في العالم' },
    referee: 'Clement Turpin',
    startTime: '2026-06-15T14:00:00Z',
    events: [
      { minute: '12', type: 'goal',        team: 'MAR', player: 'حكيم زياش',    assist: 'أمين حارث' },
      { minute: '42', type: 'goal',        team: 'BEL', player: 'روميلو لوكاكو', assist: 'كيفان دي برويني' },
      { minute: '78', type: 'goal',        team: 'MAR', player: 'يوسف النصيري',  assist: 'حكيم زياش' },
      { minute: '85', type: 'red_card',    team: 'BEL', player: 'ويتسيل',         assist: null },
    ],
    stats: {
      possession: [44, 56],
      shots: [9, 18],
      shotsOnTarget: [4, 5],
      corners: [3, 8],
      fouls: [14, 11],
    },
    lineups: { home: [], away: [] },
  },
  {
    id: 'm5',
    status: 'UPCOMING',
    minute: null,
    homeTeam: TEAMS.ENG,
    awayTeam: TEAMS.USA,
    homeScore: null,
    awayScore: null,
    group: 'المجموعة E',
    venue: 'Rose Bowl',
    city: 'باسادينا',
    stadium: { name: 'Rose Bowl', city: 'باسادينا', capacity: 88565, info: 'استضاف نهائي كأس العالم 1994' },
    referee: 'Felix Brych',
    startTime: '2026-06-16T02:00:00Z',
    events: [],
    stats: null,
    lineups: { home: [], away: [] },
  },
]

// ─── Mock Leaderboard ─────────────────────────────────────────────────────────

export const LEADERBOARD = [
  { rank: 1,  name: 'أحمد الشمري',  avatar: null, points: 145, correct: 18, streak: 4 },
  { rank: 2,  name: 'محمد الزهراني', avatar: null, points: 132, correct: 16, streak: 2 },
  { rank: 3,  name: 'سارة القحطاني', avatar: null, points: 120, correct: 15, streak: 3 },
  { rank: 4,  name: 'خالد العمري',   avatar: null, points: 108, correct: 13, streak: 0 },
  { rank: 5,  name: 'نورة الرشيد',   avatar: null, points: 95,  correct: 12, streak: 1 },
  { rank: 6,  name: 'عمر السعيد',    avatar: null, points: 87,  correct: 11, streak: 2 },
  { rank: 7,  name: 'لمياء العتيبي', avatar: null, points: 80,  correct: 10, streak: 0 },
  { rank: 8,  name: 'أنت',           avatar: null, points: 72,  correct: 9,  streak: 1, isMe: true },
  { rank: 9,  name: 'فيصل الدوسري',  avatar: null, points: 65,  correct: 8,  streak: 0 },
  { rank: 10, name: 'ريم الحربي',    avatar: null, points: 58,  correct: 7,  streak: 0 },
]

// ─── Mock Players (card system) ───────────────────────────────────────────────

export const PLAYER_RARITIES = {
  COMMON:    { label: 'عادي',    color: '#6B7280', bg: '#1F2937' },
  RARE:      { label: 'نادر',    color: '#3B82F6', bg: '#1E3A5F' },
  LEGENDARY: { label: 'أسطوري', color: '#F59E0B', bg: '#3D2A00' },
}

export const MOCK_PLAYERS = [
  {
    id: 'p1',
    name: 'ليونيل ميسي',
    team: TEAMS.ARG,
    position: 'مهاجم',
    number: 10,
    rarity: 'LEGENDARY',
    power: 96,
    wcGoals: 13,
    age: 38,
    club: 'إنتر ميامي',
    stats: { goals: 13, assists: 8, matches: 26 },
    injured: false,
  },
  {
    id: 'p2',
    name: 'كيليان مبابي',
    team: TEAMS.FRA,
    position: 'مهاجم',
    number: 10,
    rarity: 'LEGENDARY',
    power: 95,
    wcGoals: 12,
    age: 27,
    club: 'ريال مدريد',
    stats: { goals: 12, assists: 6, matches: 22 },
    injured: false,
  },
  {
    id: 'p3',
    name: 'فينيسيوس جونيور',
    team: TEAMS.BRA,
    position: 'جناح',
    number: 7,
    rarity: 'RARE',
    power: 92,
    wcGoals: 5,
    age: 25,
    club: 'ريال مدريد',
    stats: { goals: 5, assists: 7, matches: 14 },
    injured: false,
  },
  {
    id: 'p4',
    name: 'إيرلينغ هالاند',
    team: TEAMS.NED,
    position: 'مهاجم',
    number: 9,
    rarity: 'LEGENDARY',
    power: 93,
    wcGoals: 4,
    age: 25,
    club: 'مانشستر سيتي',
    stats: { goals: 4, assists: 2, matches: 8 },
    injured: false,
  },
  {
    id: 'p5',
    name: 'حكيم زياش',
    team: TEAMS.MAR,
    position: 'جناح',
    number: 7,
    rarity: 'RARE',
    power: 85,
    wcGoals: 3,
    age: 31,
    club: 'غلطة سراي',
    stats: { goals: 3, assists: 5, matches: 12 },
    injured: false,
  },
  {
    id: 'p6',
    name: 'لوكاس باكيتا',
    team: TEAMS.BRA,
    position: 'وسط',
    number: 8,
    rarity: 'RARE',
    power: 88,
    wcGoals: 1,
    age: 26,
    club: 'وست هام',
    stats: { goals: 1, assists: 4, matches: 12 },
    injured: false,
  },
]

// ─── Mock Friend Groups ────────────────────────────────────────────────────────

export const MOCK_FRIEND_GROUPS = [
  {
    id: 'fg1',
    name: 'أصدقاء العمل',
    code: 'KRX-7842',
    admin: 'أنت',
    members: [
      { name: 'أنت',           points: 72, rank: 1, isMe: true },
      { name: 'فهد الغامدي',   points: 65, rank: 2 },
      { name: 'نواف الرشيدي',  points: 58, rank: 3 },
      { name: 'رانيا السهلي',  points: 40, rank: 4 },
    ],
  },
  {
    id: 'fg2',
    name: 'العائلة',
    code: 'KRX-3391',
    admin: 'أبي',
    members: [
      { name: 'أخي الكبير',   points: 90, rank: 1 },
      { name: 'أنت',           points: 72, rank: 2, isMe: true },
      { name: 'أبي',           points: 60, rank: 3 },
    ],
  },
]

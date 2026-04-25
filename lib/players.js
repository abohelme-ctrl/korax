// مجموعة اللاعبين المتاحة للمكافآت والهدايا اليومية

export const PLAYERS = [
  { id: 1,  name: 'ليونيل ميسي',       flag: '🇦🇷', position: 'مهاجم', club: 'إنتر ميامي',       rarity: 'legendary', rating: 91 },
  { id: 2,  name: 'كيليان مبابي',       flag: '🇫🇷', position: 'مهاجم', club: 'ريال مدريد',       rarity: 'legendary', rating: 91 },
  { id: 3,  name: 'فينيسيوس جونيور',   flag: '🇧🇷', position: 'جناح',  club: 'ريال مدريد',       rarity: 'legendary', rating: 90 },
  { id: 4,  name: 'إيرلينج هالاند',    flag: '🇳🇴', position: 'مهاجم', club: 'مانشستر سيتي',    rarity: 'rare',      rating: 88 },
  { id: 5,  name: 'رودري',              flag: '🇪🇸', position: 'وسط',   club: 'مانشستر سيتي',    rarity: 'rare',      rating: 87 },
  { id: 6,  name: 'ليامين يامال',       flag: '🇪🇸', position: 'جناح',  club: 'برشلونة',          rarity: 'rare',      rating: 86 },
  { id: 7,  name: 'بوكايو ساكا',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'جناح',  club: 'أرسنال',            rarity: 'rare',      rating: 85 },
  { id: 8,  name: 'رافينيا',            flag: '🇧🇷', position: 'جناح',  club: 'برشلونة',          rarity: 'rare',      rating: 85 },
  { id: 9,  name: 'جود بيلينغهام',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'وسط',   club: 'ريال مدريد',       rarity: 'rare',      rating: 87 },
  { id: 10, name: 'خوليان ألفاريز',    flag: '🇦🇷', position: 'مهاجم', club: 'أتلتيكو مدريد',   rarity: 'common',    rating: 83 },
  { id: 11, name: 'ماك أليستر',         flag: '🇦🇷', position: 'وسط',   club: 'ليفربول',          rarity: 'common',    rating: 82 },
  { id: 12, name: 'كريستيان رومرو',    flag: '🇦🇷', position: 'مدافع', club: 'توتنهام',           rarity: 'common',    rating: 83 },
  { id: 13, name: 'أكرف هاكيمي',       flag: '🇲🇦', position: 'مدافع', club: 'باريس سان جيرمان', rarity: 'rare',      rating: 85 },
  { id: 14, name: 'ميليتاو',            flag: '🇧🇷', position: 'مدافع', club: 'ريال مدريد',       rarity: 'common',    rating: 83 },
  { id: 15, name: 'أليسون',             flag: '🇧🇷', position: 'حارس',  club: 'ليفربول',          rarity: 'common',    rating: 84 },
  { id: 16, name: 'تيبو كورتوا',       flag: '🇧🇪', position: 'حارس',  club: 'ريال مدريد',       rarity: 'rare',      rating: 86 },
  { id: 17, name: 'مارتينيز',           flag: '🇦🇷', position: 'حارس',  club: 'أستون فيلا',       rarity: 'common',    rating: 83 },
  { id: 18, name: 'لوكا مودريتش',      flag: '🇭🇷', position: 'وسط',   club: 'ريال مدريد',       rarity: 'rare',      rating: 85 },
  { id: 19, name: 'برونو فيرنانديز',   flag: '🇵🇹', position: 'وسط',   club: 'مانشستر يونايتد',  rarity: 'rare',      rating: 85 },
  { id: 20, name: 'أنطوان غريزمان',    flag: '🇫🇷', position: 'مهاجم', club: 'أتلتيكو مدريد',   rarity: 'rare',      rating: 85 },
  { id: 21, name: 'محمد صلاح',         flag: '🇪🇬', position: 'جناح',  club: 'ليفربول',          rarity: 'rare',      rating: 87 },
  { id: 22, name: 'هاري كين',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'مهاجم', club: 'بايرن ميونخ',       rarity: 'rare',      rating: 87 },
  { id: 23, name: 'فيران توريس',       flag: '🇪🇸', position: 'جناح',  club: 'برشلونة',          rarity: 'common',    rating: 81 },
  { id: 24, name: 'ميسون ماونت',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'وسط',   club: 'مانشستر يونايتد',  rarity: 'common',    rating: 80 },
]

/**
 * يختار لاعباً عشوائياً من المجموعة المحددة
 * @param {'common'|'rare'|'legendary'} rarity
 * @returns player object
 */
export function getRandomPlayer(rarity) {
  const pool = PLAYERS.filter(p => p.rarity === rarity)
  // إذا لم يوجد لاعبون من هذا المستوى، نأخذ من common
  const finalPool = pool.length > 0 ? pool : PLAYERS.filter(p => p.rarity === 'common')
  return finalPool[Math.floor(Math.random() * finalPool.length)]
}

/**
 * يحدد ندرة المكافأة بناءً على النقاط
 * @param {number} points
 * @returns {'common'|'rare'|'legendary'}
 */
export function rarityFromPoints(points) {
  if (points >= 3) return 'rare'
  if (points >= 1) return 'common'
  return 'common'
}

/**
 * يحفظ كرت لاعب في localStorage
 * @param {object} player
 * @param {string} source
 */
export function saveCardToStorage(player, source = 'reward') {
  const existing = JSON.parse(localStorage.getItem('korax_my_cards') || '[]')
  const newCard  = {
    ...player,
    obtainedAt: new Date().toISOString().slice(0, 10),
    source,
  }
  localStorage.setItem('korax_my_cards', JSON.stringify([...existing, newCard]))
  return newCard
}

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { fetchTeamSquad } from '@/lib/api-football'

// ── خريطة: ID الداخلي للتطبيق → ID الفعلي في API-Football ─────────────────────
const APP_TO_API_ID = {
  '16':   16,    // المكسيك
  '1531': 1531,  // جنوب أفريقيا
  '149':  17,    // كوريا الجنوبية
  '798':  770,   // التشيك
  '101':  5529,  // كندا
  '776':  1113,  // البوسنة
  '164':  1569,  // قطر
  '15':   15,    // سويسرا
  '6':    6,     // البرازيل
  '32':   31,    // المغرب
  '507':  2386,  // هايتي
  '1108': 1108,  // اسكتلندا
  '779':  2380,  // باراغواي
  '25':   20,    // أستراليا
  '741':  777,   // تركيا
  '3':    25,    // ألمانيا
  '1532': 5530,  // كوراساو
  '31':   1501,  // ساحل العاج
  '57':   null,  // بوليفيا (ليست في كأس العالم 2026)
  '1':    1118,  // هولندا
  '2601': 12,    // اليابان
  '744':  5,     // السويد
  '4601': 28,    // تونس
  '26':   26,    // الأرجنتين
  '9':    9,     // إسبانيا
  '1529': null,  // الكاميرون (ليست في كأس العالم 2026)
  '23':   7,     // أوروغواي
  '66':   null,  // رومانيا (ليست في كأس العالم 2026)
  '2':    2,     // فرنسا
  '43':   null,  // ألبانيا (ليست في كأس العالم 2026)
  '50':   null,  // غينيا (ليست في كأس العالم 2026)
  '27':   27,    // البرتغال
  '141':  23,    // السعودية
  '60':   2382,  // الإكوادور
  '110':  null,  // زيمبابوي (ليست في كأس العالم 2026)
  '10':   10,    // إنجلترا
  '3001': 3,     // كرواتيا
  '85':   null,  // الدنمارك (ليست في كأس العالم 2026)
  '1530': null,  // فلسطين (ليست في كأس العالم 2026)
  '36':   32,    // مصر
  '33':   13,    // السنغال
  '96':   1532,  // الجزائر
  '48':   1,     // بلجيكا
  '46':   1532,  // الجزائر (alias)
  '4':    1,     // بلجيكا (alias)
  '13':   7,     // أوروغواي (alias)
  '66':   22,    // إيران
  '1537': 4673,  // نيوزيلندا
  '1533': 1533,  // الرأس الأخضر
  '56':   8,     // كولومبيا
  '1534': 1568,  // أوزبكستان
  '1535': 1508,  // الكونغو الديمقراطية
  '755':  1090,  // النرويج
  '796':  1567,  // العراق
  '775':  775,   // النمسا
  '765':  1548,  // الأردن
  '14':   1504,  // غانا
  '1536': 11,    // بنما
}

// ─── بيانات جميع المنتخبات ────────────────────────────────────────────────────
const TEAMS_DATA = {
  // المجموعة A
  '16': {
    name: 'المكسيك', nameEn: 'Mexico', flag: '🇲🇽', group: 'A', stars: 0,
    coach: 'خافيير أغيري',
    confederation: 'كونكاكاف',
    wcTitles: [],
    bestResult: 'ربع النهائي (1970, 1986)',
    players: [
      { name: 'غييرمو أوشوا',  pos: 'حارس',  club: 'أمريكا',   age: 39 },
      { name: 'سيزار مونتيس',  pos: 'مدافع',  club: 'فياريال',  age: 27 },
      { name: 'إيرفينج لوزانو', pos: 'جناح',  club: 'PSV',      age: 29 },
      { name: 'أليخاندرو موريانو', pos: 'وسط', club: 'أمريكا',  age: 26 },
    ],
    about: 'من أكثر منتخبات أمريكا الشمالية حضوراً في كأس العالم بـ 17 مشاركة.',
  },
  '1531': {
    name: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦', group: 'A', stars: 0,
    coach: 'هيوغو برووس',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الأول (2010 - ملعبها)',
    players: [
      { name: 'رونجين وليامز', pos: 'حارس', club: 'كايزر شيفز', age: 30 },
      { name: 'سيفو خالا',    pos: 'مدافع', club: 'أورلاندو بيراتس', age: 28 },
      { name: 'إيفاندرو',     pos: 'جناح',  club: 'رينجرز', age: 24 },
    ],
    about: 'استضافت بطولة 2010، أول كأس عالم تُقام في أفريقيا.',
  },
  '149': {
    name: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷', group: 'A', stars: 0,
    coach: 'هونغ ميونغ-بو',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'نصف النهائي (2002)',
    players: [
      { name: 'سون هيونغ-مين', pos: 'جناح',  club: 'توتنهام',    age: 32 },
      { name: 'كيم مين-جاي',   pos: 'مدافع', club: 'بايرن ميونخ', age: 28 },
      { name: 'هوانغ هي-تشان', pos: 'مهاجم', club: 'وولفرهامبتون', age: 28 },
      { name: 'لي كانغ-إن',    pos: 'وسط',   club: 'باريس سان جيرمان', age: 23 },
    ],
    about: 'حقق رابع مركز في مونديال 2002 الذي استضافه مشتركاً مع اليابان.',
  },
  '798': {
    name: 'التشيك', nameEn: 'Czech Republic', flag: '🇨🇿', group: 'A', stars: 0,
    coach: 'إيفان هاشيك',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'نهائي كأس العالم (1934, 1962 - تشيكوسلوفاكيا)',
    players: [
      { name: 'توماس فاتشليك', pos: 'حارس',  club: 'فيكتوريا بلزن', age: 34 },
      { name: 'باتريك شيك',    pos: 'مهاجم', club: 'باير ليفركوزن', age: 29 },
      { name: 'توماس سوسيك',   pos: 'وسط',   club: 'وست هام',       age: 29 },
    ],
    about: 'حاملة لقب بطولة الأمم الأوروبية 1976 باسم تشيكوسلوفاكيا.',
  },

  // المجموعة B
  '101': {
    name: 'كندا', nameEn: 'Canada', flag: '🇨🇦', group: 'B', stars: 0,
    coach: 'جيسي مارش',
    confederation: 'كونكاكاف',
    wcTitles: [],
    bestResult: 'الدور الأول (1986)',
    players: [
      { name: 'ميلان بوردا',   pos: 'حارس',  club: 'إنتر ميلان', age: 30 },
      { name: 'ألفونسو ديفيز', pos: 'مدافع', club: 'بايرن ميونخ', age: 24 },
      { name: 'جوناثان ديفيد', pos: 'مهاجم', club: 'ليل',         age: 25 },
      { name: 'تاجون بوكيليا', pos: 'جناح',  club: 'بيرنلي',      age: 26 },
    ],
    about: 'أحد المضيفين الثلاثة لكأس العالم 2026 مع الولايات المتحدة والمكسيك.',
  },
  '776': {
    name: 'البوسنة والهرسك', nameEn: 'Bosnia & Herzegovina', flag: '🇧🇦', group: 'B', stars: 0,
    coach: 'سيرجي باربارز',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'الدور الأول (2014)',
    players: [
      { name: 'أسمير بيغوفيتش', pos: 'حارس',  club: 'القادسية',        age: 38 },
      { name: 'سافيو بالوفا',   pos: 'وسط',   club: 'مانشستر سيتي',    age: 25 },
      { name: 'إدين دزيكو',     pos: 'مهاجم', club: 'فنربخشه',         age: 39 },
    ],
    about: 'شاركت في كأس العالم لأول مرة عام 2014 في البرازيل.',
  },
  '164': {
    name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', group: 'B', stars: 0,
    coach: 'لويس غارسيا',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'الدور الأول (2022)',
    players: [
      { name: 'مشعل بارشم', pos: 'حارس',  club: 'الريان', age: 30 },
      { name: 'أكرم عفيف',  pos: 'جناح',  club: 'الصدد',  age: 27 },
      { name: 'علي عسقر',   pos: 'وسط',   club: 'الريان', age: 25 },
    ],
    about: 'استضافت بطولة 2022 وكان ذلك الظهور الأول لها في كأس العالم.',
  },
  '15': {
    name: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭', group: 'B', stars: 0,
    coach: 'مورات ياكين',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'ربع النهائي (1934, 1938, 1954)',
    players: [
      { name: 'يان سومر',      pos: 'حارس',  club: 'إنتر ميلان',    age: 36 },
      { name: 'غرانيت جاكا',   pos: 'وسط',   club: 'باير ليفركوزن', age: 32 },
      { name: 'شيردان شاقيري', pos: 'جناح',  club: 'شيكاغو فاير',   age: 33 },
    ],
    about: 'حاضرة بانتظام في كأس العالم، تتميز بالتنوع الثقافي في تشكيلتها.',
  },

  // المجموعة C
  '6': {
    name: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷', group: 'C', stars: 5,
    coach: 'دوريفال جونيور',
    confederation: 'كونميبول',
    wcTitles: [1958, 1962, 1970, 1994, 2002],
    bestResult: 'بطل (5 مرات)',
    players: [
      { name: 'أليسون بيكر',      pos: 'حارس',  club: 'ليفربول',             age: 32 },
      { name: 'ماركينيوس',        pos: 'مدافع', club: 'باريس سان جيرمان',    age: 31 },
      { name: 'فينيسيوس جونيور',  pos: 'جناح',  club: 'ريال مدريد',          age: 24 },
      { name: 'رودريغو',          pos: 'جناح',  club: 'ريال مدريد',          age: 24 },
      { name: 'رافينيا',          pos: 'جناح',  club: 'برشلونة',             age: 28 },
      { name: 'لوكاس بايو',       pos: 'وسط',   club: 'مانشستر سيتي',        age: 27 },
    ],
    about: 'الأكثر تتويجاً بكأس العالم في التاريخ، الدولة الوحيدة التي شاركت في جميع نسخ البطولة الـ 22.',
  },
  '32': {
    name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', group: 'C', stars: 0,
    coach: 'وليد الركراكي',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'نصف النهائي (2022)',
    players: [
      { name: 'ياسين بونو',    pos: 'حارس',  club: 'الهلال',              age: 33 },
      { name: 'أشرف حكيمي',   pos: 'مدافع', club: 'باريس سان جيرمان',    age: 26 },
      { name: 'حكيم زياش',    pos: 'جناح',  club: 'غلطة سراي',            age: 32 },
      { name: 'يوسف النصيري', pos: 'مهاجم', club: 'الهلال',              age: 27 },
      { name: 'سفيان بوفال',  pos: 'جناح',  club: 'سيفيل',               age: 28 },
    ],
    about: 'أول منتخب أفريقي وعربي يصل إلى نصف نهائي كأس العالم في قطر 2022.',
  },
  '507': {
    name: 'هايتي', nameEn: 'Haiti', flag: '🇭🇹', group: 'C', stars: 0,
    coach: 'مارك كوكيني',
    confederation: 'كونكاكاف',
    wcTitles: [],
    bestResult: 'الدور الأول (1974)',
    players: [
      { name: 'جيمس لوي',         pos: 'حارس',  club: 'ريمس',      age: 29 },
      { name: 'نيكولاس إيسلاند',  pos: 'مهاجم', club: 'نيس',       age: 24 },
    ],
    about: 'تعود لكأس العالم لأول مرة منذ 1974 بعد غياب طويل.',
  },
  '1108': {
    name: 'اسكتلندا', nameEn: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', stars: 0,
    coach: 'ستيف كلارك',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'الدور الأول (8 مشاركات)',
    players: [
      { name: 'أنغوس غان',     pos: 'حارس',  club: 'ستوك سيتي',   age: 28 },
      { name: 'أندي روبرتسون', pos: 'مدافع', club: 'ليفربول',      age: 30 },
      { name: 'جون ماكغين',    pos: 'وسط',   club: 'أستون فيلا',  age: 30 },
      { name: 'سكوت ماكتومينا', pos: 'جناح', club: 'ليفربول',      age: 27 },
    ],
    about: 'من أعرق المنتخبات، شاركت في كأس العالم 8 مرات وعادت بعد غياب منذ 1998.',
  },

  // المجموعة D  (id:2 هنا لفرنسا، USA في المجموعة I)
  '2': {
    name: 'فرنسا', nameEn: 'France', flag: '🇫🇷', group: 'I', stars: 2,
    coach: 'ديديه ديشان',
    confederation: 'يويفا',
    wcTitles: [1998, 2018],
    bestResult: 'بطل (مرتان)',
    players: [
      { name: 'مايك ماينيان',   pos: 'حارس',  club: 'باريس سان جيرمان', age: 25 },
      { name: 'ويليام سالييبا', pos: 'مدافع', club: 'أرسنال',            age: 24 },
      { name: 'كيليان مبابي',   pos: 'مهاجم', club: 'ريال مدريد',        age: 26 },
      { name: 'أنطوان غريزمان', pos: 'مهاجم', club: 'أتلتيكو مدريد',    age: 33 },
      { name: 'أورليان تشاميني', pos: 'وسط',  club: 'ريال مدريد',        age: 24 },
      { name: 'ماركوس ثوريام',  pos: 'مهاجم', club: 'إنتر ميلان',        age: 27 },
    ],
    about: 'الديكة، أحد أقوى المنتخبات في العالم بجيل استثنائي يقوده مبابي.',
  },
  '779': {
    name: 'باراغواي', nameEn: 'Paraguay', flag: '🇵🇾', group: 'D', stars: 0,
    coach: 'غوستافو كوسيتاس',
    confederation: 'كونميبول',
    wcTitles: [],
    bestResult: 'ربع النهائي (2010)',
    players: [
      { name: 'أنطونيو سيلفا', pos: 'حارس',  club: 'أوليمبيا',      age: 29 },
      { name: 'مريو مارتينيز', pos: 'مهاجم', club: 'سيرو بورتينيو', age: 28 },
    ],
    about: 'منتخب متوازن يعتمد على قوة الجماعة والتنظيم الدفاعي.',
  },
  '25': {
    name: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', group: 'D', stars: 0,
    coach: 'توني بوبوفيتش',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'ربع النهائي (2006)',
    players: [
      { name: 'ماثيو ريان',  pos: 'حارس',  club: 'ريال سوسيداد',    age: 33 },
      { name: 'متياس ليكي', pos: 'مهاجم', club: 'شتوتغارت',         age: 26 },
      { name: 'كريغ غودوين', pos: 'جناح', club: 'الحزم',            age: 32 },
      { name: 'ريلي ماكغري', pos: 'وسط',  club: 'مانشستر سيتي',     age: 26 },
    ],
    about: 'السوكيروز، وصلوا لربع نهائي 2006 في أفضل إنجازاتهم.',
  },
  '741': {
    name: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', group: 'D', stars: 0,
    coach: 'فينتشنزو مونتيلا',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'المركز الثالث (2002)',
    players: [
      { name: 'ألتاي بايندر',      pos: 'حارس',  club: 'شالكه',       age: 27 },
      { name: 'هاكان شالهانوغلو',  pos: 'وسط',   club: 'إنتر ميلان', age: 31 },
      { name: 'أردا غولر',         pos: 'وسط',   club: 'ريال مدريد', age: 20 },
      { name: 'كنان يلدز',         pos: 'وسط',   club: 'يوفنتوس',    age: 20 },
    ],
    about: 'جيل موهوب يقوده شالهانوغلو وأردا غولر، يطمح للتقدم بعيداً.',
  },

  // المجموعة E
  '3': {
    name: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', group: 'E', stars: 4,
    coach: 'يوليان ناغلسمان',
    confederation: 'يويفا',
    wcTitles: [1954, 1974, 1990, 2014],
    bestResult: 'بطل (4 مرات)',
    players: [
      { name: 'مانويل نوير',    pos: 'حارس',  club: 'بايرن ميونخ',    age: 39 },
      { name: 'أنطونيو رودييغر', pos: 'مدافع', club: 'ريال مدريد',     age: 32 },
      { name: 'يوشوا كيميش',   pos: 'وسط',   club: 'بايرن ميونخ',    age: 30 },
      { name: 'فلوريان فيرتز', pos: 'وسط',   club: 'باير ليفركوزن', age: 22 },
      { name: 'جامال موسيالا', pos: 'جناح',  club: 'بايرن ميونخ',    age: 22 },
      { name: 'تومي موللر',    pos: 'مهاجم', club: 'بايرن ميونخ',    age: 36 },
    ],
    about: 'المانشافت، أحد أعظم المنتخبات في تاريخ كأس العالم بـ 4 ألقاب.',
  },
  '1532': {
    name: 'كوراساو', nameEn: 'Curaçao', flag: '🇨🇼', group: 'E', stars: 0,
    coach: 'رياو',
    confederation: 'كونكاكاف',
    wcTitles: [],
    bestResult: 'أول مشاركة',
    players: [
      { name: 'ليفانو كومانان', pos: 'حارس', club: 'كابري', age: 27 },
    ],
    about: 'ظهور أول في كأس العالم لجزيرة كوراساو الكاريبية الصغيرة.',
  },
  '31': {
    name: 'ساحل العاج', nameEn: "Côte d'Ivoire", flag: '🇨🇮', group: 'E', stars: 0,
    coach: 'إيمريك لابورت',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الأول (2006, 2010, 2014)',
    players: [
      { name: 'سيمون عدينغرا', pos: 'جناح',  club: 'براسيلز',    age: 23 },
      { name: 'فرانك كيسي',    pos: 'وسط',   club: 'برشلونة',    age: 28 },
      { name: 'نيكولاس بيبي',  pos: 'مهاجم', club: 'غلطة سراي',  age: 29 },
    ],
    about: 'أسود الفيلة، من أقوى المنتخبات الأفريقية بتاريخ غني.',
  },
  '57': {
    name: 'الإكوادور', nameEn: 'Ecuador', flag: '🇪🇨', group: 'E', stars: 0,
    coach: 'سيباستيان بيكيرمان',
    confederation: 'كونميبول',
    wcTitles: [],
    bestResult: 'الدور الثاني (2006)',
    players: [
      { name: 'إنير فالنسيا',  pos: 'مهاجم', club: 'مانشستر يونايتد', age: 30 },
      { name: 'بيرفيس إيسيبا', pos: 'مهاجم', club: 'ليفانتي',         age: 22 },
    ],
    about: 'شاركت في 4 نسخ من كأس العالم وتمتلك جيلاً من الشباب الواعد.',
  },

  // المجموعة F
  '1': {
    name: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', group: 'F', stars: 0,
    coach: 'رونالد كومان',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'نهائي (1974, 1978, 2010)',
    players: [
      { name: 'بارت فيربروغن',   pos: 'حارس',  club: 'مانشستر يونايتد', age: 23 },
      { name: 'فيرجيل فان دايك', pos: 'مدافع', club: 'ليفربول',         age: 33 },
      { name: 'كوفي مبيومو',     pos: 'جناح',  club: 'مانشستر سيتي',    age: 23 },
      { name: 'دافي كلاسن',      pos: 'وسط',   club: 'أياكس',           age: 31 },
      { name: 'وات فيخورست',     pos: 'مهاجم', club: 'بيرنلي',          age: 26 },
    ],
    about: 'الطواحين البرتقال، وصلوا للنهائي ثلاث مرات دون تتويج بلقب.',
  },
  '26': {
    name: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷', group: 'J', stars: 3,
    coach: 'ليونيل سكالوني',
    confederation: 'كونميبول',
    wcTitles: [1978, 1986, 2022],
    bestResult: 'بطل (3 مرات)',
    players: [
      { name: 'إيميلياتو مارتينيز', pos: 'حارس',  club: 'أستون فيلا',     age: 32 },
      { name: 'كريستيان رومانيو',   pos: 'مدافع', club: 'إنتر ميلان',     age: 26 },
      { name: 'ليونيل ميسي',        pos: 'مهاجم', club: 'إنتر ميامي',     age: 38 },
      { name: 'جوليان ألفاريز',     pos: 'مهاجم', club: 'أتلتيكو مدريد', age: 25 },
      { name: 'ماك أليستر',         pos: 'وسط',   club: 'ليفربول',        age: 26 },
      { name: 'رودريغو دي بول',     pos: 'وسط',   club: 'أتلتيكو مدريد', age: 31 },
    ],
    about: 'حاملة اللقب الحالية بعد انتزاع لقب 2022 في قطر بقيادة ميسي الخالد.',
  },
  '744': {
    name: 'السويد', nameEn: 'Sweden', flag: '🇸🇪', group: 'F', stars: 0,
    coach: 'يون دال توفن',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'المركز الثالث (1994)',
    players: [
      { name: 'روبن مولبرغ',     pos: 'حارس',  club: 'هلمستاد',  age: 36 },
      { name: 'ألكسندر إيزاك',  pos: 'مهاجم', club: 'نيوكاسل',  age: 25 },
      { name: 'ديفيد وينتيريبورغ', pos: 'مهاجم', club: 'فولهام', age: 24 },
    ],
    about: 'الأكثر نجاحاً في الإسكندنافيا، وصلوا لنصف نهائي 1994.',
  },
  '46': {
    name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', group: 'J', stars: 0,
    coach: 'بيغا',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الثاني (2014)',
    players: [
      { name: 'رايس مبولهي',   pos: 'حارس',  club: 'كي شايف',   age: 35 },
      { name: 'رياض محرز',     pos: 'جناح',  club: 'النصر',     age: 33 },
      { name: 'يوسف عطال',     pos: 'مدافع', club: 'نيس',        age: 28 },
      { name: 'فارس شائبي',    pos: 'وسط',   club: 'إيسبانيول', age: 26 },
    ],
    about: 'الفنيق الصحراوي، توّج ببطولة أمم أفريقيا 2019 ويمتلك نجوماً في أكبر الدوريات.',
  },

  // المجموعة G
  '4': {
    name: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪', group: 'G', stars: 0,
    coach: 'دومينيكو تيدسكو',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'المركز الثالث (2018)',
    players: [
      { name: 'كيليان كاسترلز', pos: 'حارس',  club: 'فولفرهامبتون', age: 32 },
      { name: 'لوكاس ديني',     pos: 'مدافع', club: 'أتلتيكو مدريد', age: 29 },
      { name: 'أمادو أندندا',   pos: 'مهاجم', club: 'كريستال بالاس', age: 23 },
    ],
    about: 'جيل ذهبي يعيش مرحلة تجديد بعد المركز الثالث في روسيا 2018.',
  },
  '36': {
    name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', group: 'G', stars: 0,
    coach: 'إيهاب الجلاد',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الأول (1934, 1990, 2018)',
    players: [
      { name: 'محمد أبو جبل', pos: 'حارس',  club: 'الزمالك',       age: 30 },
      { name: 'محمد صلاح',    pos: 'جناح',  club: 'ليفربول',       age: 33 },
      { name: 'مصطفى محمد',   pos: 'مهاجم', club: 'نيس',           age: 27 },
      { name: 'عمر مرموش',    pos: 'مهاجم', club: 'مانشستر سيتي', age: 26 },
    ],
    about: 'الفراعنة يعودون لكأس العالم بقيادة محمد صلاح في أوج لياقته.',
  },
  '66': {
    name: 'إيران', nameEn: 'Iran', flag: '🇮🇷', group: 'G', stars: 0,
    coach: 'أمير قليخاني',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'الدور الثاني (2022)',
    players: [
      { name: 'علي رضا بيرانوند', pos: 'حارس',  club: 'الشباب',         age: 33 },
      { name: 'سردار أزمون',      pos: 'مهاجم', club: 'باير ليفركوزن', age: 29 },
      { name: 'مهدي طارمي',       pos: 'مهاجم', club: 'إنتر ميلان',    age: 32 },
    ],
    about: 'نمور آسيا، حضور مستمر في كأس العالم خلال العقود الأخيرة.',
  },
  '1537': {
    name: 'نيوزيلندا', nameEn: 'New Zealand', flag: '🇳🇿', group: 'G', stars: 0,
    coach: 'ديزمي دوناتيني',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'الدور الأول (1982, 2010)',
    players: [
      { name: 'مايكل وو',     pos: 'حارس',  club: 'أوكلاند',          age: 28 },
      { name: 'كريس وود',     pos: 'مهاجم', club: 'نوتنهام فورست', age: 33 },
    ],
    about: 'All Whites، شاركوا في كأس العالم مرتين سابقاً.',
  },

  // المجموعة H
  '9': {
    name: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', group: 'H', stars: 1,
    coach: 'لويس دي لا فوينتي',
    confederation: 'يويفا',
    wcTitles: [2010],
    bestResult: 'بطل (2010)',
    players: [
      { name: 'أوناي سيمون',    pos: 'حارس',  club: 'أتلتيك بلباو', age: 28 },
      { name: 'دانييل كارفاخال', pos: 'مدافع', club: 'ريال مدريد',   age: 33 },
      { name: 'رودري',           pos: 'وسط',   club: 'مانشستر سيتي', age: 28 },
      { name: 'بيدري',           pos: 'وسط',   club: 'برشلونة',      age: 22 },
      { name: 'لامين يامال',     pos: 'جناح',  club: 'برشلونة',      age: 18 },
      { name: 'نيكو وليامز',     pos: 'جناح',  club: 'أتلتيك بلباو', age: 22 },
    ],
    about: 'لا رويا، بطلة أمم أوروبا 2024 تدخل المونديال وهي في أفضل حالاتها.',
  },
  '1533': {
    name: 'الرأس الأخضر', nameEn: 'Cape Verde', flag: '🇨🇻', group: 'H', stars: 0,
    coach: 'بوبي بيريرا',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'أول مشاركة',
    players: [
      { name: 'كافي فيليكس', pos: 'حارس',  club: 'هارلم',    age: 28 },
      { name: 'شارل كاسترو', pos: 'مهاجم', club: 'سبورتينغ', age: 27 },
    ],
    about: 'أول مشاركة لجزر الرأس الأخضر في كأس العالم.',
  },
  '141': {
    name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', group: 'H', stars: 0,
    coach: 'هيرفي رينار',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'الدور الثاني (1994)',
    players: [
      { name: 'محمد العويس',    pos: 'حارس',  club: 'الهلال',  age: 32 },
      { name: 'سالم الدوسري',  pos: 'جناح',  club: 'الهلال',  age: 28 },
      { name: 'فراس البريكان', pos: 'مهاجم', club: 'النصر',   age: 27 },
      { name: 'علي البليهي',   pos: 'مدافع', club: 'الهلال',  age: 33 },
    ],
    about: 'الصقور الخضر، أذهلوا العالم بالفوز على الأرجنتين في قطر 2022.',
  },
  '13': {
    name: 'أوروغواي', nameEn: 'Uruguay', flag: '🇺🇾', group: 'H', stars: 2,
    coach: 'مارسيلو بيلسا',
    confederation: 'كونميبول',
    wcTitles: [1930, 1950],
    bestResult: 'بطل (مرتان)',
    players: [
      { name: 'سيرخيو روشيت',     pos: 'حارس',  club: 'ريال مدريد',     age: 27 },
      { name: 'رونالد أراخو',     pos: 'مدافع', club: 'برشلونة',        age: 25 },
      { name: 'داروين نونيز',     pos: 'مهاجم', club: 'ليفربول',        age: 25 },
      { name: 'فيدريكو فالفيرده', pos: 'وسط',   club: 'ريال مدريد',     age: 26 },
      { name: 'لويس سواريز',      pos: 'مهاجم', club: 'ريفر بليت',      age: 38 },
    ],
    about: 'أحد مؤسسي كأس العالم وبطله الأول عام 1930، يمتلك جيلاً موهوباً.',
  },

  // المجموعة I
  '33': {
    name: 'السنغال', nameEn: 'Senegal', flag: '🇸🇳', group: 'I', stars: 0,
    coach: 'علي سيدي دياللو',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'ربع النهائي (2002)',
    players: [
      { name: 'ساني منمي',       pos: 'حارس',  club: 'نيس',            age: 28 },
      { name: 'كاليدو كوليبالي', pos: 'مدافع', club: 'الهلال',         age: 33 },
      { name: 'ساديو ماني',      pos: 'جناح',  club: 'ساوثهامبتون',   age: 33 },
      { name: 'إسماعيل ساري',   pos: 'مهاجم', club: 'أتلتيكو مدريد', age: 26 },
    ],
    about: 'الأسود من الترانجي، وصلوا لربع النهائي 2002 وتوّجوا بأمم أفريقيا 2021.',
  },
  '796': {
    name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', group: 'I', stars: 0,
    coach: 'خيسوس كاساس',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'الدور الأول (1986)',
    players: [
      { name: 'بشار رسن',     pos: 'جناح',  club: 'إيلبراوندسر', age: 28 },
      { name: 'أيمن حسين',   pos: 'مهاجم', club: 'الشباب',       age: 28 },
      { name: 'عماد الزيدان', pos: 'وسط',  club: 'الزوراء',      age: 29 },
    ],
    about: 'أسود الرافدين يعودون لكأس العالم لأول مرة منذ 1986 بعد تأهل تاريخي.',
  },
  '755': {
    name: 'النرويج', nameEn: 'Norway', flag: '🇳🇴', group: 'I', stars: 0,
    coach: 'ستاله سولباكن',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'الدور الثاني (1998)',
    players: [
      { name: 'أورجان ندانيل نتهو', pos: 'حارس',  club: 'بايرن ميونخ',   age: 26 },
      { name: 'إرلينج هالاند',      pos: 'مهاجم', club: 'مانشستر سيتي', age: 25 },
      { name: 'مارتن أودغارد',      pos: 'وسط',   club: 'أرسنال',        age: 26 },
      { name: 'ألكسندر سورلوث',    pos: 'مهاجم', club: 'أتلتيكو مدريد', age: 29 },
    ],
    about: 'يمتلك هالاند وأودغارد، أحد أشرس المنتخبات الأوروبية في الوقت الراهن.',
  },

  // المجموعة J
  '775': {
    name: 'النمسا', nameEn: 'Austria', flag: '🇦🇹', group: 'J', stars: 0,
    coach: 'راينر هاسنهوتل',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'المركز الثالث (1954)',
    players: [
      { name: 'باتريك بينهارت',   pos: 'حارس',  club: 'فولفسبورغ',       age: 27 },
      { name: 'ماركو أرنوتوفيتش', pos: 'مهاجم', club: 'إنتر ميلان',      age: 36 },
      { name: 'فلوريان كاينز',    pos: 'وسط',   club: 'بوروسيا دورتموند', age: 27 },
      { name: 'مارسيل سابيتزر',  pos: 'وسط',   club: 'برشلونة',          age: 31 },
    ],
    about: 'عادوا لكأس العالم بعد غياب طويل، يمتلكون وسطاً متميزاً بالدوريات الكبرى.',
  },
  '765': {
    name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', group: 'J', stars: 0,
    coach: 'حسين عمو',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'أول مشاركة',
    players: [
      { name: 'يزن النعيمات',  pos: 'حارس',  club: 'الجزيرة',  age: 27 },
      { name: 'عبدالله نصيب',  pos: 'مهاجم', club: 'لورينت',   age: 23 },
      { name: 'مصعب بني عيسى', pos: 'مهاجم', club: 'ويفورد',   age: 25 },
    ],
    about: 'أول مشاركة للأردن في نهائيات كأس العالم، وصلوا لنهائي كأس آسيا 2023.',
  },

  // المجموعة K
  '27': {
    name: 'البرتغال', nameEn: 'Portugal', flag: '🇵🇹', group: 'K', stars: 0,
    coach: 'روبرتو مارتينيز',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'المركز الثالث (1966)',
    players: [
      { name: 'ديوغو كوستا',      pos: 'حارس',  club: 'بورتو',               age: 25 },
      { name: 'روبن دياز',         pos: 'مدافع', club: 'مانشستر سيتي',        age: 28 },
      { name: 'كريستيانو رونالدو', pos: 'مهاجم', club: 'النصر',               age: 41 },
      { name: 'برونو فيرنانديز',   pos: 'وسط',   club: 'مانشستر يونايتد',    age: 30 },
      { name: 'رافاييل لياو',      pos: 'جناح',  club: 'ميلان',               age: 26 },
      { name: 'فيتينهو',           pos: 'وسط',   club: 'مانشستر سيتي',        age: 25 },
    ],
    about: 'أقوى جيل برتغالي على الإطلاق، يقوده رونالدو في آخر مشاركاته الكأسية.',
  },
  '56': {
    name: 'كولومبيا', nameEn: 'Colombia', flag: '🇨🇴', group: 'K', stars: 0,
    coach: 'نيستور لورنزو',
    confederation: 'كونميبول',
    wcTitles: [],
    bestResult: 'ربع النهائي (2014)',
    players: [
      { name: 'كامييو فارغاس',  pos: 'حارس',  club: 'ميلان',          age: 32 },
      { name: 'داييروت ساريز',  pos: 'مدافع', club: 'ليفربول',        age: 27 },
      { name: 'جيمس رودريغيز', pos: 'وسط',   club: 'ريال مدريد',    age: 34 },
      { name: 'لويس دياز',      pos: 'جناح',  club: 'ليفربول',        age: 28 },
    ],
    about: 'يمتلكون لويس دياز وجيمس رودريغيز في خطهم الهجومي الخطير.',
  },
  '1534': {
    name: 'أوزبكستان', nameEn: 'Uzbekistan', flag: '🇺🇿', group: 'K', stars: 0,
    coach: 'سرفر جباروف',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'أول مشاركة',
    players: [
      { name: 'أبدوقودير حسانوف', pos: 'حارس',  club: 'لوكاموتيف', age: 26 },
      { name: 'إلدور شومورودوف',  pos: 'مهاجم', club: 'رومان',      age: 29 },
    ],
    about: 'ظهور أول لأوزبكستان في كأس العالم بعد تطور ملحوظ في كرتهم.',
  },
  '1535': {
    name: 'الكونغو الديمقراطية', nameEn: 'DR Congo', flag: '🇨🇩', group: 'K', stars: 0,
    coach: 'سيدريك كابامبا',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الثاني (1974 - باسم زائير)',
    players: [
      { name: 'جول كيمبيمبي',   pos: 'حارس',  club: 'إيه إس فيتا', age: 28 },
      { name: 'فرنسيسكو مويمبا', pos: 'مهاجم', club: 'مارسيليا',    age: 22 },
    ],
    about: 'الفيلة الوحشية يعودون لكأس العالم بعد غياب منذ 1974.',
  },

  // اليابان (id مخصص 2601 لتجنب التعارض مع الأرجنتين)
  '2601': {
    name: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', group: 'F', stars: 0,
    coach: 'هاجيمي موريياسو',
    confederation: 'الاتحاد الآسيوي',
    wcTitles: [],
    bestResult: 'دور الـ16 (2002, 2010, 2018, 2022)',
    players: [
      { name: 'شوييشي غوندا',    pos: 'حارس',  club: 'توتنهام',  age: 31 },
      { name: 'واتارو إيندو',    pos: 'وسط',   club: 'ليفربول',  age: 31 },
      { name: 'داييتشي كاميادا', pos: 'وسط',   club: 'ليون',     age: 28 },
      { name: 'ريو ميانامو',     pos: 'مهاجم', club: 'فنربخشه',  age: 27 },
    ],
    about: 'السامورائي الأزرق، من أقوى منتخبات آسيا ويسعون للوصول لربع النهائي لأول مرة.',
  },
  // تونس (id مخصص 4601 لتجنب التعارض مع الجزائر)
  '4601': {
    name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', group: 'F', stars: 0,
    coach: 'جلال قادري',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'الدور الثاني (1978)',
    players: [
      { name: 'عياش مثلوثي',  pos: 'حارس',  club: 'الوداد',   age: 29 },
      { name: 'يوسف مساكني',  pos: 'جناح',  club: 'الهلال',   age: 26 },
      { name: 'الزبير نصري',  pos: 'مهاجم', club: 'الاتحاد',  age: 32 },
    ],
    about: 'نسور قرطاج، حاضرون بانتظام في كأس العالم ويطمحون للتقدم هذه المرة.',
  },
  // كرواتيا (id مخصص 3001 لتجنب التعارض مع ألمانيا)
  '3001': {
    name: 'كرواتيا', nameEn: 'Croatia', flag: '🇭🇷', group: 'L', stars: 0,
    coach: 'زلاتكو داليتش',
    confederation: 'يويفا',
    wcTitles: [],
    bestResult: 'نهائي (2018)، المركز الثالث (2022)',
    players: [
      { name: 'دومينيك ليفاكوفيتش', pos: 'حارس',  club: 'فنربخشه',         age: 29 },
      { name: 'لوكا مودريتش',        pos: 'وسط',   club: 'ريال مدريد',      age: 40 },
      { name: 'إيفان بيريشيتش',      pos: 'جناح',  club: 'هايدوك سبليت',   age: 35 },
      { name: 'مارتن بوتكيفيتش',    pos: 'مهاجم', club: 'أتلتيكو مدريد',  age: 26 },
    ],
    about: 'وصلوا للنهائي 2018 وجاؤوا ثالثاً 2022، يقودهم الأسطورة مودريتش في آخر مشاركاته.',
  },

  // المجموعة L
  '10': {
    name: 'إنجلترا', nameEn: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', stars: 1,
    coach: 'توماس توخيل',
    confederation: 'يويفا',
    wcTitles: [1966],
    bestResult: 'بطل (1966)',
    players: [
      { name: 'جوردان بيكفورد',  pos: 'حارس',  club: 'إيفرتون',            age: 31 },
      { name: 'جود بيلينغهام',   pos: 'وسط',   club: 'ريال مدريد',         age: 22 },
      { name: 'هاري كين',        pos: 'مهاجم', club: 'بايرن ميونخ',        age: 32 },
      { name: 'فيل فودن',        pos: 'جناح',  club: 'مانشستر سيتي',       age: 25 },
      { name: 'بوكايو ساكا',     pos: 'جناح',  club: 'أرسنال',             age: 23 },
      { name: 'ماركوس راشفورد', pos: 'جناح',  club: 'مانشستر يونايتد',  age: 27 },
    ],
    about: 'الأسود الثلاثة ينتظرون اللقب الثاني منذ 1966 مع جيل ذهبي من أبرز المواهب.',
  },
  '14': {
    name: 'غانا', nameEn: 'Ghana', flag: '🇬🇭', group: 'L', stars: 0,
    coach: 'أوتو أدو',
    confederation: 'كاف',
    wcTitles: [],
    bestResult: 'ربع النهائي (2010)',
    players: [
      { name: 'لورانس أتي-زيغي', pos: 'حارس',  club: 'سانت-تروند', age: 33 },
      { name: 'محمد كوداه',      pos: 'مهاجم', club: 'ساوثهامبتون', age: 24 },
      { name: 'توماس بارتيي',    pos: 'وسط',   club: 'برايتون',     age: 30 },
    ],
    about: 'النجوم السود، كادوا يصلون لنصف نهائي 2010 لولا ركلة الجزاء المفقودة.',
  },
  '1536': {
    name: 'بنما', nameEn: 'Panama', flag: '🇵🇦', group: 'L', stars: 0,
    coach: 'توماس سيفيرانو',
    confederation: 'كونكاكاف',
    wcTitles: [],
    bestResult: 'الدور الأول (2018)',
    players: [
      { name: 'لويس مجور', pos: 'حارس', club: 'تاكوما ديفيانس', age: 33 },
      { name: 'رولاندو بلاكمان', pos: 'جناح', club: 'سانت غالن', age: 27 },
    ],
    about: 'بنما تعود لكأس العالم بعد ظهورها الأول عام 2018.',
  },
}

// مجموعات كأس العالم 2026
const GROUPS = [
  { id: 'A', teams: [
    { id: '16',   name: 'المكسيك',          flag: '🇲🇽', stars: 0 },
    { id: '1531', name: 'جنوب أفريقيا',     flag: '🇿🇦', stars: 0 },
    { id: '149',  name: 'كوريا الجنوبية',   flag: '🇰🇷', stars: 0 },
    { id: '798',  name: 'التشيك',            flag: '🇨🇿', stars: 0 },
  ]},
  { id: 'B', teams: [
    { id: '101',  name: 'كندا',              flag: '🇨🇦', stars: 0 },
    { id: '776',  name: 'البوسنة والهرسك',  flag: '🇧🇦', stars: 0 },
    { id: '164',  name: 'قطر',               flag: '🇶🇦', stars: 0 },
    { id: '15',   name: 'سويسرا',            flag: '🇨🇭', stars: 0 },
  ]},
  { id: 'C', teams: [
    { id: '6',    name: 'البرازيل',          flag: '🇧🇷', stars: 5 },
    { id: '32',   name: 'المغرب',            flag: '🇲🇦', stars: 0 },
    { id: '507',  name: 'هايتي',             flag: '🇭🇹', stars: 0 },
    { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', stars: 0 },
  ]},
  { id: 'D', teams: [
    { id: '2',    name: 'الولايات المتحدة', flag: '🇺🇸', stars: 0 },
    { id: '779',  name: 'باراغواي',          flag: '🇵🇾', stars: 0 },
    { id: '25',   name: 'أستراليا',          flag: '🇦🇺', stars: 0 },
    { id: '741',  name: 'تركيا',             flag: '🇹🇷', stars: 0 },
  ]},
  { id: 'E', teams: [
    { id: '3',    name: 'ألمانيا',           flag: '🇩🇪', stars: 4 },
    { id: '1532', name: 'كوراساو',           flag: '🇨🇼', stars: 0 },
    { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮', stars: 0 },
    { id: '57',   name: 'الإكوادور',         flag: '🇪🇨', stars: 0 },
  ]},
  { id: 'F', teams: [
    { id: '1',    name: 'هولندا',            flag: '🇳🇱', stars: 0 },
    { id: '2601', name: 'اليابان',           flag: '🇯🇵', stars: 0 },
    { id: '744',  name: 'السويد',            flag: '🇸🇪', stars: 0 },
    { id: '4601', name: 'تونس',              flag: '🇹🇳', stars: 0 },
  ]},
  { id: 'G', teams: [
    { id: '4',    name: 'بلجيكا',            flag: '🇧🇪', stars: 0 },
    { id: '36',   name: 'مصر',               flag: '🇪🇬', stars: 0 },
    { id: '66',   name: 'إيران',             flag: '🇮🇷', stars: 0 },
    { id: '1537', name: 'نيوزيلندا',         flag: '🇳🇿', stars: 0 },
  ]},
  { id: 'H', teams: [
    { id: '9',    name: 'إسبانيا',           flag: '🇪🇸', stars: 1 },
    { id: '1533', name: 'الرأس الأخضر',      flag: '🇨🇻', stars: 0 },
    { id: '141',  name: 'السعودية',          flag: '🇸🇦', stars: 0 },
    { id: '13',   name: 'أوروغواي',          flag: '🇺🇾', stars: 2 },
  ]},
  { id: 'I', teams: [
    { id: '2',    name: 'فرنسا',             flag: '🇫🇷', stars: 2 },
    { id: '33',   name: 'السنغال',           flag: '🇸🇳', stars: 0 },
    { id: '796',  name: 'العراق',            flag: '🇮🇶', stars: 0 },
    { id: '755',  name: 'النرويج',           flag: '🇳🇴', stars: 0 },
  ]},
  { id: 'J', teams: [
    { id: '26',   name: 'الأرجنتين',         flag: '🇦🇷', stars: 3 },
    { id: '46',   name: 'الجزائر',           flag: '🇩🇿', stars: 0 },
    { id: '775',  name: 'النمسا',            flag: '🇦🇹', stars: 0 },
    { id: '765',  name: 'الأردن',            flag: '🇯🇴', stars: 0 },
  ]},
  { id: 'K', teams: [
    { id: '27',   name: 'البرتغال',          flag: '🇵🇹', stars: 0 },
    { id: '56',   name: 'كولومبيا',          flag: '🇨🇴', stars: 0 },
    { id: '1534', name: 'أوزبكستان',         flag: '🇺🇿', stars: 0 },
    { id: '1535', name: 'الكونغو',           flag: '🇨🇩', stars: 0 },
  ]},
  { id: 'L', teams: [
    { id: '10',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stars: 1 },
    { id: '3001', name: 'كرواتيا',           flag: '🇭🇷', stars: 0 },
    { id: '14',   name: 'غانا',              flag: '🇬🇭', stars: 0 },
    { id: '1536', name: 'بنما',              flag: '🇵🇦', stars: 0 },
  ]},
]

// بحث عن المنتخب من البيانات الرئيسية أو من مصفوفة المجموعات
function getTeamData(id) {
  if (TEAMS_DATA[id]) return TEAMS_DATA[id]

  // إذا لم يوجد في البيانات المفصّلة، نبني من GROUPS
  for (const group of GROUPS) {
    for (const team of group.teams) {
      if (team.id === id) {
        return {
          name: team.name,
          nameEn: '',
          flag: team.flag,
          group: group.id,
          stars: team.stars,
          coach: 'قيد التحديث',
          confederation: '',
          wcTitles: [],
          bestResult: 'قيد التحديث',
          players: [],
          about: `${team.name} تشارك في المجموعة ${group.id} من كأس العالم 2026.`,
        }
      }
    }
  }
  return null
}

// إيجاد مجموعة المنتخب بحسب الـ id والاسم
function getGroupForTeam(id, teamName) {
  // نبحث بالاسم إذا أمكن (لتجنب تعارض المعرّفات المكررة)
  if (teamName) {
    for (const group of GROUPS) {
      for (const team of group.teams) {
        if (team.name === teamName) return group
      }
    }
  }
  // وإلا نرجع أول مجموعة تحتوي هذا الـ id
  for (const group of GROUPS) {
    for (const team of group.teams) {
      if (team.id === id) return group
    }
  }
  return null
}

// ─── الصفحة ───────────────────────────────────────────────────────────────────
export default function NationPage() {
  const params  = useParams()
  const id      = params?.id
  const team    = getTeamData(id)
  const group   = team ? getGroupForTeam(id, team.name) : null

  const [squad,        setSquad]        = useState(null)   // null = جاري التحميل
  const [squadLoading, setSquadLoading] = useState(true)

  useEffect(() => {
    const apiId = APP_TO_API_ID[id]
    if (!apiId) { setSquadLoading(false); return }
    fetchTeamSquad(apiId)
      .then(data => setSquad(data || []))
      .catch(() => setSquad([]))
      .finally(() => setSquadLoading(false))
  }, [id])

  if (!team) {
    return (
      <div>
        <Header title="منتخب" back />
        <div className="page-content flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <p className="text-5xl mb-4">🏴</p>
            <p className="text-text font-bold mb-1">المنتخب غير موجود</p>
            <Link href="/groups" className="text-primary text-sm">العودة للمجموعات</Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div>
      <Header title={team.name} back />

      <div className="page-content pb-6">

        {/* ─── Hero ─── */}
        <div className="bg-gradient-to-b from-primary/20 to-bg px-4 pt-8 pb-10 text-center">
          <div className="text-8xl mb-3 drop-shadow-lg select-none">{team.flag}</div>
          <h1 className="text-2xl font-black text-text">{team.name}</h1>
          {team.nameEn && (
            <p className="text-muted text-sm mt-0.5">{team.nameEn}</p>
          )}
          {team.stars > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {Array.from({ length: team.stars }).map((_, i) => (
                <span key={i} className="text-2xl">⭐</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {team.group && (
              <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                المجموعة {team.group}
              </span>
            )}
            {team.confederation && (
              <span className="px-3 py-1 rounded-full bg-card border border-border text-muted text-xs">
                {team.confederation}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4">

          {/* ─── بطاقات معلومات سريعة ─── */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon="🏆" label="ألقاب كأس العالم"
              value={team.stars > 0 ? `${team.stars} لقب` : 'لم يتوّج'}
              highlight={team.stars > 0} />
            <InfoCard icon="🎯" label="أفضل نتيجة"   value={team.bestResult} />
            <InfoCard icon="👨‍💼" label="المدرب"        value={team.coach} />
            <InfoCard icon="🌍" label="الاتحاد"       value={team.confederation || 'دولي'} />
          </div>

          {/* ─── سنوات التتويج ─── */}
          {team.wcTitles?.length > 0 && (
            <div className="card p-4">
              <h2 className="font-black text-text text-sm mb-3 flex items-center gap-2">
                <span className="text-gold">🏆</span> سنوات التتويج
              </h2>
              <div className="flex flex-wrap gap-2">
                {team.wcTitles.map(year => (
                  <div key={year}
                    className="flex items-center gap-1.5 bg-gold/10 border border-gold/30 rounded-xl px-3 py-2">
                    <span className="text-gold text-lg">⭐</span>
                    <span className="text-gold font-black text-sm">{year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── عن المنتخب ─── */}
          {team.about && (
            <div className="card p-4">
              <h2 className="font-black text-text text-sm mb-2 flex items-center gap-2">
                <span>📖</span> عن المنتخب
              </h2>
              <p className="text-muted text-sm leading-relaxed">{team.about}</p>
            </div>
          )}

          {/* ─── القائمة الرسمية من API ─── */}
          {squadLoading && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>👥</span>
                <span className="font-black text-text text-sm">القائمة الرسمية</span>
              </div>
              <div className="space-y-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 bg-card-hover rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {!squadLoading && squad && squad.length > 0 && (
            <div className="card p-4">
              <h2 className="font-black text-text text-sm mb-3 flex items-center gap-2">
                <span>👥</span> القائمة الرسمية
                <span className="text-[10px] text-muted font-normal mr-auto">{squad.length} لاعب</span>
              </h2>
              {['حارس مرمى','مدافع','وسط','مهاجم'].map(pos => {
                const group = squad.filter(p => p.pos === pos)
                if (group.length === 0) return null
                const posIcons = { 'حارس مرمى':'🧤', 'مدافع':'🛡️', 'وسط':'⚙️', 'مهاجم':'⚡' }
                return (
                  <div key={pos} className="mb-3 last:mb-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs">{posIcons[pos]}</span>
                      <span className="text-[10px] font-black text-muted uppercase">{pos}</span>
                      <span className="text-[9px] text-muted">({group.length})</span>
                    </div>
                    <div className="space-y-1">
                      {group.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-card-hover transition-colors">
                          <span className="text-[10px] font-black text-muted w-5 text-center flex-shrink-0">
                            {p.number || '—'}
                          </span>
                          <span className="text-xs font-medium text-text flex-1 truncate">{p.name}</span>
                          {p.age && (
                            <span className="text-[9px] text-muted flex-shrink-0">{p.age}س</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!squadLoading && (!squad || squad.length === 0) && team.players?.length > 0 && (
            <div className="card p-4">
              <h2 className="font-black text-text text-sm mb-3 flex items-center gap-2">
                <span>⚽</span> أبرز اللاعبين
              </h2>
              <div className="space-y-2.5">
                {team.players.map((player, i) => (
                  <PlayerRow key={i} player={player} />
                ))}
              </div>
            </div>
          )}

          {/* ─── المجموعة ─── */}
          {group && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-black text-xs">{group.id}</span>
                </div>
                <h2 className="font-black text-text text-sm">المجموعة {group.id}</h2>
                <span className="text-muted text-xs mr-auto">قبل انطلاق البطولة</span>
              </div>

              {/* رأس الجدول */}
              <div className="flex items-center px-4 py-2 bg-card-hover border-b border-border">
                <span className="flex-1 text-[10px] text-muted font-bold">المنتخب</span>
                {['ل','ف','ت','خ','ن'].map(h => (
                  <span key={h} className="w-7 text-center text-[10px] text-muted font-bold">{h}</span>
                ))}
              </div>

              {group.teams.map((t, i) => {
                const isCurrent = t.name === team.name
                return (
                  <Link key={t.id} href={`/nation/${t.id}`}
                    className={`flex items-center px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 border-r-2 border-r-primary'
                        : 'active:bg-card-hover'
                    }`}
                  >
                    <span className={`text-xs font-black w-5 ${
                      i === 0 ? 'text-gold' : i === 1 ? 'text-primary' : 'text-muted'
                    }`}>{i + 1}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{t.flag}</span>
                      <span className={`text-sm font-bold truncate ${isCurrent ? 'text-primary' : 'text-text'}`}>
                        {t.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                          أنت هنا
                        </span>
                      )}
                    </div>
                    {[0,0,0,0,0].map((_, j) => (
                      <span key={j} className={`w-7 text-center text-xs ${
                        j === 4 ? 'font-black text-primary' : 'text-muted'
                      }`}>0</span>
                    ))}
                  </Link>
                )
              })}
            </div>
          )}

          {/* ─── زر العودة ─── */}
          <Link href="/groups"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-card border border-border text-muted text-sm font-bold active:scale-95 transition-transform">
            <span>←</span>
            <span>عودة للمجموعات</span>
          </Link>

        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// ─── مكوّنات مساعدة ───────────────────────────────────────────────────────────

function InfoCard({ icon, label, value, highlight }) {
  return (
    <div className={`card p-3 ${highlight ? 'border-gold/40 bg-gold/5' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] text-muted font-medium">{label}</span>
      </div>
      <p className={`text-sm font-black leading-tight ${highlight ? 'text-gold' : 'text-text'}`}>
        {value}
      </p>
    </div>
  )
}

function PlayerRow({ player }) {
  const posColors = {
    'حارس':  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'مدافع': 'text-blue-400  bg-blue-400/10  border-blue-400/20',
    'وسط':   'text-green-400 bg-green-400/10 border-green-400/20',
    'جناح':  'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'مهاجم': 'text-red-400   bg-red-400/10   border-red-400/20',
  }
  const cls = posColors[player.pos] || 'text-muted bg-muted/10 border-muted/20'

  return (
    <div className="flex items-center gap-3">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cls}`}>
        {player.pos}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text truncate">{player.name}</p>
        {player.club && (
          <p className="text-[10px] text-muted truncate">{player.club}</p>
        )}
      </div>
      {player.age && (
        <span className="text-[10px] text-muted flex-shrink-0">{player.age} سنة</span>
      )}
    </div>
  )
}

export default function sitemap() {
  const base = 'https://korax.live'
  const now  = new Date().toISOString()

  // ─── الصفحات الثابتة ───────────────────────────────────────────────────────
  const staticPages = [
    { url: base,               priority: 1.0,  changeFrequency: 'daily'   },
    { url: `${base}/groups`,   priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${base}/predict`,  priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${base}/simulator`,priority: 0.8,  changeFrequency: 'weekly'  },
    { url: `${base}/compare`,  priority: 0.8,  changeFrequency: 'weekly'  },
    { url: `${base}/news`,     priority: 0.9,  changeFrequency: 'hourly'  },
    { url: `${base}/quiz`,     priority: 0.8,  changeFrequency: 'daily'   },
    { url: `${base}/stadiums`, priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${base}/gift`,     priority: 0.6,  changeFrequency: 'daily'   },
  ].map(page => ({ ...page, lastModified: now }))

  // ─── صفحات المنتخبات (48 منتخب) ───────────────────────────────────────────
  const teamIds = [
    '16','1531','149','798',        // المجموعة A
    '101','776','164','15',         // المجموعة B
    '6','32','507','1108',          // المجموعة C
    '779','25','741','164',         // المجموعة D
    '3','1532','31','57',           // المجموعة E
    '1','2601','744','4601',        // المجموعة F
    '26','21','112','24',           // المجموعة G
    '9','1529','23','66',           // المجموعة H
    'USA','2','43','50',            // المجموعة I
    '27','141','60','110',          // المجموعة J
    '10','3001','85','1530',        // المجموعة K
    '36','33','96','48',            // المجموعة L
  ]

  const teamPages = [...new Set(teamIds)].map(id => ({
    url:             `${base}/nation/${id}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  return [...staticPages, ...teamPages]
}

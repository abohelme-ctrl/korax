// يولّد أيقونة PNG للـ PWA ديناميكياً بدون ملفات خارجية

export async function GET(req, { params }) {
  const size = parseInt(params.size) || 192
  const half = size / 2
  const r    = size * 0.18   // radius of inner circle

  // SVG بسيط: خلفية زرقاء داكنة + حرف K
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0A0E1A"/>
      <stop offset="100%" stop-color="#0d1f3c"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#22C55E"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>

  <!-- Accent circle -->
  <circle cx="${half}" cy="${half}" r="${half * 0.65}" fill="url(#accent)" opacity="0.15"/>

  <!-- Soccer ball lines (subtle) -->
  <circle cx="${half}" cy="${half}" r="${half * 0.62}" fill="none" stroke="#3B82F6" stroke-width="${size * 0.012}" opacity="0.2"/>

  <!-- "K" letter -->
  <text
    x="${half}"
    y="${half + size * 0.12}"
    font-family="'Arial Black', 'Arial', sans-serif"
    font-weight="900"
    font-size="${size * 0.42}"
    fill="url(#accent)"
    text-anchor="middle"
    dominant-baseline="middle"
  >K</text>

  <!-- Small football -->
  <text
    x="${half + size * 0.22}"
    y="${half - size * 0.18}"
    font-size="${size * 0.14}"
    text-anchor="middle"
  >⚽</text>
</svg>`.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

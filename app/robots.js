export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile', '/login'],
    },
    sitemap: 'https://korax.live/sitemap.xml',
  }
}

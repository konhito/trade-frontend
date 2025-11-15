import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.mytradejournal.co.in'
  
  // Static pages
  const routes = [
    '',
    '/about',
    '/pricing',
    '/support',
    '/contact',
    '/privacy',
    '/terms',
    '/disclaimers',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return routes
}


import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/authentication/',
          '/signin/',
          '/signup/',
          '/auth/verify/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/authentication/',
          '/signin/',
          '/signup/',
        ],
      },
    ],
    sitemap: 'https://www.mytradejournal.co.in/sitemap.xml',
  }
}



import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/onboarding/',
          '/profile/',
          '/chat/',
          '/chats/',
          '/notifications/',
          '/shortlist/',
          '/settings/',
          '/posts/new',
          '/services/my-requests',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

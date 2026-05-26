import type { MetadataRoute } from 'next';

import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/clubs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let clubRoutes: MetadataRoute.Sitemap = [];
  try {
    const clubs = await db.clubProfile.findMany({
      where: { verificationStatus: 'VERIFIED' },
      select: { id: true, updatedAt: true },
    });
    clubRoutes = clubs.map((club) => ({
      url: `${baseUrl}/clubs/${club.id}`,
      lastModified: club.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during static export — return static routes only
  }

  return [...staticRoutes, ...clubRoutes];
}

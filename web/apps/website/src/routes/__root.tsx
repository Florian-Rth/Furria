import type { PublicWebsitePicture } from '@furria/api-client';
import '@furria/ui/fonts';
import { KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundScreen } from '@/components/NotFoundScreen';
import { ThemeColorMeta } from '@/components/ThemeColorMeta/ThemeColorMeta';
import { PreviewAccessProvider } from '@/features/preview-access';
import { queryClient } from '@/lib/query-client';
import type { RouteHead } from '@/lib/seo';
import { publicWebsitePictures } from '@/lib/website-pictures/api';
import { siteShareImageMeta } from '@/lib/website-pictures/share-image-meta';

const RootComponent: FC = () => (
  <KkThemeProvider>
    <QueryClientProvider client={queryClient}>
      <PreviewAccessProvider>
        <HeadContent />
        <ThemeColorMeta />
        <Outlet />
      </PreviewAccessProvider>
    </QueryClientProvider>
  </KkThemeProvider>
);

const loadWebsitePictures = (): Promise<PublicWebsitePicture[]> =>
  publicWebsitePictures.ensure().catch((): PublicWebsitePicture[] => []);

export const Route = createRootRoute({
  loader: loadWebsitePictures,
  head: ({ loaderData }): RouteHead => ({
    meta: [
      { title: 'FURRIA' },
      {
        name: 'description',
        content:
          'FURRIA — Furrscher Carnevals Club e.V. Veranstaltungen, Karten, Neuigkeiten und der Weg in den Verein. Gross - Furria!',
      },
      { property: 'og:locale', content: 'de_DE' },
      { property: 'og:site_name', content: 'FURRIA' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      ...siteShareImageMeta(loaderData ?? []),
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundScreen,
});

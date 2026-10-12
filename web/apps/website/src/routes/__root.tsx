import '@furria/ui/fonts';
import { KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundScreen } from '@/components/NotFoundScreen';
import { ShareImageAltMeta } from '@/components/ShareImageAltMeta';
import { ThemeColorMeta } from '@/components/ThemeColorMeta/ThemeColorMeta';
import { PreviewAccessProvider } from '@/features/preview-access';
import { queryClient } from '@/lib/query-client';
import type { RouteHead } from '@/lib/seo';

const RootComponent: FC = () => (
  <KkThemeProvider>
    <QueryClientProvider client={queryClient}>
      <PreviewAccessProvider>
        <HeadContent />
        <ThemeColorMeta />
        <ShareImageAltMeta />
        <Outlet />
      </PreviewAccessProvider>
    </QueryClientProvider>
  </KkThemeProvider>
);

export const Route = createRootRoute({
  head: (): RouteHead => ({
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
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundScreen,
});

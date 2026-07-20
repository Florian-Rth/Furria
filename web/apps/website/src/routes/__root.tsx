import '@furria/ui/fonts';
import { KkThemeProvider, kkTokens } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { PreviewAccessProvider } from '@/features/preview-access';
import { queryClient } from '@/lib/query-client';
import type { RouteHead } from '@/lib/seo';

// Providers + head + outlet only — page chrome lives in the _site layout route.
const RootComponent: FC = () => (
  <KkThemeProvider>
    <QueryClientProvider client={queryClient}>
      <PreviewAccessProvider>
        <HeadContent />
        <Outlet />
      </PreviewAccessProvider>
    </QueryClientProvider>
  </KkThemeProvider>
);

// Site-wide head defaults. Child routes override per entry (deduped by
// name/property, deepest match wins) — today only the title, via head().
// og:image stays root-relative until the production domain exists; making it
// absolute is part of the prerender/launch work (see feature-seo-meta.md).
export const Route = createRootRoute({
  head: (): RouteHead => ({
    meta: [
      { title: 'FURRIA' },
      {
        name: 'description',
        content:
          'FURRIA — Furrscher Carnevals Club e.V. Programm, Tickets, Neuigkeiten und der Weg in den Verein. Gross - Furria!',
      },
      { name: 'theme-color', content: kkTokens.color.light.bg },
      { property: 'og:locale', content: 'de_DE' },
      { property: 'og:site_name', content: 'FURRIA' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/og-default.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: RootComponent,
});

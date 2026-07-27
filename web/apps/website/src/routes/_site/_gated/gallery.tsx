import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const GalleryComponent: FC = () => (
  <PlaceholderPage eyebrow="BILDER AUS DER SESSION" title="Galerie" />
);

export const Route = createFileRoute('/_site/_gated/gallery')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Galerie') }] }),
  component: GalleryComponent,
});

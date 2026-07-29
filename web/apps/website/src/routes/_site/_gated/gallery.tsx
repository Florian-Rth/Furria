import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ALBUMS, GalleryPage } from '@/features/gallery';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const GalleryComponent: FC = () => <GalleryPage albums={ALBUMS} />;

export const Route = createFileRoute('/_site/_gated/gallery')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Galerie') }] }),
  component: GalleryComponent,
});

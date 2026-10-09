import { createFileRoute } from '@tanstack/react-router';
import { GalleryScreen } from '@/features/gallery';
import { ensurePublicGallery } from '@/lib/public-gallery/api';
import type { GallerySection } from '@/lib/public-gallery/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

export const Route = createFileRoute('/_site/_gated/gallery')({
  loader: (): Promise<GallerySection[] | null> => ensurePublicGallery().catch((): null => null),
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Galerie') }] }),
  component: GalleryScreen,
});

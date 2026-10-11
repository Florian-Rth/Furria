import { createFileRoute } from '@tanstack/react-router';
import { GalleryScreen } from '@/features/gallery';
import { publicGallery } from '@/lib/public-gallery/api';
import type { GallerySection } from '@/lib/public-gallery/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

export const Route = createFileRoute('/_site/_gated/gallery')({
  loader: (): Promise<GallerySection[] | null> => publicGallery.ensure().catch((): null => null),
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Galerie') }] }),
  component: GalleryScreen,
});

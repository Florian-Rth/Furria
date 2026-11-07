import { createFileRoute } from '@tanstack/react-router';
import { GalleryScreen } from '@/features/gallery/components/GalleryScreen';
import { publicGallery } from '@/lib/public-gallery/api';
import type { GallerySection } from '@/lib/public-gallery/schemas';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

export const Route = createFileRoute('/_site/gallery')({
  loader: (): Promise<GallerySection[] | null> => publicGallery.ensure().catch((): null => null),
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.gallery),
  component: GalleryScreen,
});

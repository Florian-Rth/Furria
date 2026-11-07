import type { PublicWebsitePicture } from '@furria/api-client';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundScreen } from '@/components/NotFoundScreen';
import { ThemeColorMeta } from '@/components/ThemeColorMeta/ThemeColorMeta';
import type { RouteHead } from '@/lib/seo/route-head';
import { SITE_META, SITE_NAME } from '@/lib/seo/route-head';
import { publicWebsitePictures } from '@/lib/website-pictures/api';
import { siteShareImageMeta } from '@/lib/website-pictures/share-image-meta';

const RootComponent: FC = () => (
  <>
    <HeadContent />
    <ThemeColorMeta />
    <Outlet />
  </>
);

const loadWebsitePictures = (): Promise<PublicWebsitePicture[]> =>
  publicWebsitePictures.ensure().catch((): PublicWebsitePicture[] => []);

export const Route = createRootRoute({
  loader: loadWebsitePictures,
  head: ({ loaderData }): RouteHead => ({
    meta: [{ title: SITE_NAME }, ...SITE_META, ...siteShareImageMeta(loaderData ?? [])],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundScreen,
});

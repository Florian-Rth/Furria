import type { FileRouteTypes } from '@/routeTree.gen';

const APP_LINK_PATHS: ReadonlySet<string> = new Set([
  '/invitation',
  '/reset-password',
] satisfies ReadonlyArray<FileRouteTypes['to']>);

const TRAILING_SLASHES = /\/+$/;

const WEB_PROTOCOLS: ReadonlySet<string> = new Set(['https:', 'http:']);

const webUrlOf = (value: string): URL | null => {
  if (!URL.canParse(value)) {
    return null;
  }

  const url = new URL(value);
  return WEB_PROTOCOLS.has(url.protocol) ? url : null;
};

export const appLinkTargetOf = (link: string, clubAppBaseUrl: string): string | null => {
  const clubApp = webUrlOf(clubAppBaseUrl);
  const url = webUrlOf(link);
  if (clubApp === null || url === null || url.origin !== clubApp.origin) {
    return null;
  }

  const path = url.pathname.replace(TRAILING_SLASHES, '');
  if (!APP_LINK_PATHS.has(path)) {
    return null;
  }

  return `${path}${url.search}${url.hash}`;
};

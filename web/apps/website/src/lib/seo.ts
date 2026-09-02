import type { AnyRouteMatch } from '@tanstack/react-router';

export type RouteHead = {
  meta: NonNullable<AnyRouteMatch['meta']>;
  links?: NonNullable<AnyRouteMatch['links']>;
  scripts?: NonNullable<AnyRouteMatch['headScripts']>;
};

export const pageTitle = (name: string): string => `${name} · FURRIA`;

export const NO_INDEX_META: RouteHead['meta'][number] = { name: 'robots', content: 'noindex' };

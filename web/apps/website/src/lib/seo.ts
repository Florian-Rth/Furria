import type { AnyRouteMatch } from '@tanstack/react-router';

export type RouteHead = {
  meta: NonNullable<AnyRouteMatch['meta']>;
  links?: NonNullable<AnyRouteMatch['links']>;
  scripts?: NonNullable<AnyRouteMatch['headScripts']>;
};

export const pageTitle = (name: string): string => `${name} · FURRIA`;

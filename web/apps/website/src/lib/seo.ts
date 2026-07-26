import type { AnyRouteMatch } from '@tanstack/react-router';

export type RouteHead = {
  meta: NonNullable<AnyRouteMatch['meta']>;
  links?: NonNullable<AnyRouteMatch['links']>;
};

export const pageTitle = (name: string): string => `${name} · FURRIA`;

import type { AnyRouteMatch } from '@tanstack/react-router';

export type RouteHead = { meta: NonNullable<AnyRouteMatch['meta']> };

export const pageTitle = (name: string): string => `${name} · FURRIA`;

import type { AnyRouteMatch } from '@tanstack/react-router';

// Return shape of a route's head() option — annotate head callbacks with it.
export type RouteHead = { meta: NonNullable<AnyRouteMatch['meta']> };

// The site-wide document-title pattern: "<German page name> · FURRIA".
// The bare "FURRIA" default for pages without a name lives in routes/__root.tsx.
export const pageTitle = (name: string): string => `${name} · FURRIA`;

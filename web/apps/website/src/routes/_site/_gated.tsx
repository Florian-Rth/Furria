import { createFileRoute, redirect } from '@tanstack/react-router';
import { readGrantedFromSession } from '@/features/preview-access';

// Pathless gate route: everything under it requires the preview grant.
// Ungated visitors are sent to '/', where the coming-soon teaser lives.
// The legal pages (imprint/privacy) stay outside — always reachable.
export const Route = createFileRoute('/_site/_gated')({
  beforeLoad: (): void => {
    if (!readGrantedFromSession(window.sessionStorage)) {
      throw redirect({ to: '/' });
    }
  },
});

import { createFileRoute, redirect } from '@tanstack/react-router';
import { readGrantedFromSession } from '@/features/preview-access';

export const Route = createFileRoute('/_site/_gated')({
  beforeLoad: (): void => {
    if (!readGrantedFromSession(window.sessionStorage)) {
      throw redirect({ to: '/' });
    }
  },
});

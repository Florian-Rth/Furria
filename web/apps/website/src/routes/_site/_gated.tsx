import { createFileRoute, redirect } from '@tanstack/react-router';
import { NotFoundPage } from '@/components/NotFoundPage';
import { readGrantedFromSession } from '@/features/preview-access';

export const Route = createFileRoute('/_site/_gated')({
  beforeLoad: (): void => {
    if (!readGrantedFromSession(window.sessionStorage)) {
      throw redirect({ to: '/' });
    }
  },
  notFoundComponent: NotFoundPage,
});

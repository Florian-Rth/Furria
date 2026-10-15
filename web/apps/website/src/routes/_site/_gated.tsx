import { createFileRoute, redirect } from '@tanstack/react-router';
import { NotFoundPage } from '@/components/NotFoundPage';
import { readGrantedFromSession } from '@/features/preview-access';
import { safeSessionStorage } from '@/lib/browser-storage';

export const Route = createFileRoute('/_site/_gated')({
  beforeLoad: (): void => {
    if (!readGrantedFromSession(safeSessionStorage)) {
      throw redirect({ to: '/' });
    }
  },
  notFoundComponent: NotFoundPage,
});

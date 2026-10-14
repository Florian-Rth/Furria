import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ImprintClubError, LegalPage, useImprintDocument } from '@/features/legal';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const ImprintComponent: FC = () => {
  const { imprint, retryClub } = useImprintDocument();
  const clubError = retryClub === null ? null : <ImprintClubError onRetry={retryClub} />;

  return <LegalPage legalDocument={imprint}>{clubError}</LegalPage>;
};

export const Route = createFileRoute('/_site/imprint')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Impressum') }] }),
  component: ImprintComponent,
});

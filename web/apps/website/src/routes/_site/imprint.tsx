import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ImprintClubError } from '@/features/legal/components/ImprintClubError';
import { LegalPage } from '@/features/legal/components/LegalPage/LegalPage';
import { useImprintDocument } from '@/features/legal/hooks/use-imprint-document';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

const ImprintComponent: FC = () => {
  const { imprint, retryClub } = useImprintDocument();
  const clubError = retryClub === null ? null : <ImprintClubError onRetry={retryClub} />;

  return <LegalPage legalDocument={imprint}>{clubError}</LegalPage>;
};

export const Route = createFileRoute('/_site/imprint')({
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.imprint),
  component: ImprintComponent,
});

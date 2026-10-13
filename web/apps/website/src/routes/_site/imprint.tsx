import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LegalPage, useImprintDocument } from '@/features/legal';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const ImprintComponent: FC = () => {
  const imprint = useImprintDocument();

  return <LegalPage legalDocument={imprint} />;
};

export const Route = createFileRoute('/_site/imprint')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Impressum') }] }),
  component: ImprintComponent,
});

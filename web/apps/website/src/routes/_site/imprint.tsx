import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { imprintContent, LegalPage } from '@/features/legal';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const ImprintComponent: FC = () => <LegalPage legalDocument={imprintContent} />;

export const Route = createFileRoute('/_site/imprint')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Impressum') }] }),
  component: ImprintComponent,
});

import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LegalPage } from '@/features/legal/components/LegalPage/LegalPage';
import { privacyContent } from '@/features/legal/privacy-content';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const PrivacyComponent: FC = () => <LegalPage legalDocument={privacyContent} />;

export const Route = createFileRoute('/_site/privacy')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Datenschutz') }] }),
  component: PrivacyComponent,
});

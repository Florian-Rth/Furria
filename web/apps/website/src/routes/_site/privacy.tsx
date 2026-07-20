import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LegalPage, privacyContent } from '@/features/legal';

const PrivacyComponent: FC = () => <LegalPage legalDocument={privacyContent} />;

export const Route = createFileRoute('/_site/privacy')({ component: PrivacyComponent });

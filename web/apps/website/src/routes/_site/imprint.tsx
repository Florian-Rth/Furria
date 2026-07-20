import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { imprintContent, LegalPage } from '@/features/legal';

const ImprintComponent: FC = () => <LegalPage legalDocument={imprintContent} />;

export const Route = createFileRoute('/_site/imprint')({ component: ImprintComponent });

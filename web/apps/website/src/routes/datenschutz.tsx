import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { datenschutzContent, LegalPage } from '@/features/legal';

const DatenschutzComponent: FC = () => <LegalPage legalDocument={datenschutzContent} />;

export const Route = createFileRoute('/datenschutz')({ component: DatenschutzComponent });

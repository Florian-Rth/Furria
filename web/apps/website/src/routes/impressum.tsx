import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { impressumContent, LegalPage } from '@/features/legal';

const ImpressumComponent: FC = () => <LegalPage legalDocument={impressumContent} />;

export const Route = createFileRoute('/impressum')({ component: ImpressumComponent });

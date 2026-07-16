import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LegalPage, useImpressumContent } from '@/features/legal';

const ImpressumComponent: FC = () => {
  const content = useImpressumContent();

  return <LegalPage legalDocument={content} />;
};

export const Route = createFileRoute('/impressum')({ component: ImpressumComponent });

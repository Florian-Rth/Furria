import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LegalPage, useDatenschutzContent } from '@/features/legal';

const DatenschutzComponent: FC = () => {
  const content = useDatenschutzContent();

  return <LegalPage legalDocument={content} />;
};

export const Route = createFileRoute('/datenschutz')({ component: DatenschutzComponent });

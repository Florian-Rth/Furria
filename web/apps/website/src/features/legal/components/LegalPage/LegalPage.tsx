import { PageLayout } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { LegalDocument } from '../../types';
import { LegalSectionBlock } from './internal/LegalSectionBlock';

interface LegalPageProps {
  legalDocument: LegalDocument;
}

export const LegalPage: FC<LegalPageProps> = ({ legalDocument }) => (
  <PageLayout>
    <PageLayout.Prose>
      <Typography variant="h1" component="h1">
        {legalDocument.title}
      </Typography>
      {legalDocument.sections.map((section) => (
        <LegalSectionBlock key={section.heading} section={section} />
      ))}
    </PageLayout.Prose>
  </PageLayout>
);

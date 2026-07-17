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
    <PageLayout.Header>
      <Typography variant="h3" component="h1">
        {legalDocument.title}
      </Typography>
    </PageLayout.Header>
    <PageLayout.Content>
      {legalDocument.sections.map((section) => (
        <LegalSectionBlock key={section.heading} section={section} />
      ))}
    </PageLayout.Content>
  </PageLayout>
);

import { PageLayout } from '@furria/ui/PageLayout';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { LegalDocument } from '../../types';
import { LegalSectionBlock } from './internal/LegalSectionBlock';

interface LegalPageProps extends PropsWithChildren {
  legalDocument: LegalDocument;
}

export const LegalPage: FC<LegalPageProps> = ({ legalDocument, children }) => (
  <PageLayout>
    <PageLayout.Prose>
      <Typography variant="h1" component="h1">
        {legalDocument.title}
      </Typography>
      {legalDocument.sections.map((section) => (
        <LegalSectionBlock key={section.heading} section={section} />
      ))}
      {children}
    </PageLayout.Prose>
  </PageLayout>
);

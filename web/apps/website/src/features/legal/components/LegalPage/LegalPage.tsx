import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { LegalDocument } from '../../types';
import { LegalPageLayout } from './internal/LegalPageLayout';
import { LegalSectionBlock } from './internal/LegalSectionBlock';

interface LegalPageProps {
  legalDocument: LegalDocument;
}

export const LegalPage: FC<LegalPageProps> = ({ legalDocument }) => (
  <LegalPageLayout>
    <Typography variant="h3" component="h1">
      {legalDocument.title}
    </Typography>
    <LegalPageLayout.Sections>
      {legalDocument.sections.map((section) => (
        <LegalSectionBlock key={section.heading} section={section} />
      ))}
    </LegalPageLayout.Sections>
  </LegalPageLayout>
);

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { LegalSection } from '../../../types';

interface LegalSectionBlockProps {
  section: LegalSection;
}

export const LegalSectionBlock: FC<LegalSectionBlockProps> = ({ section }) => (
  <Stack component="section" sx={{ gap: 1.5 }}>
    <Typography variant="h5" component="h2">
      {section.heading}
    </Typography>
    {section.paragraphs.map((paragraph) => (
      <Typography key={paragraph} variant="body1" sx={{ color: 'text.secondary' }}>
        {paragraph}
      </Typography>
    ))}
  </Stack>
);

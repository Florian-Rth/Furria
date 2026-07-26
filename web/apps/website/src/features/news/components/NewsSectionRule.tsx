import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface NewsSectionRuleProps {
  label: string;
}

export const NewsSectionRule: FC<NewsSectionRuleProps> = ({ label }) => (
  <Stack direction="row" data-kk-news-rule sx={{ alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
    <Box
      aria-hidden
      sx={{ width: '0.875rem', height: '0.875rem', bgcolor: 'primary.main', flexShrink: 0 }}
    />
    <Typography variant="h5" component="h2" sx={{ letterSpacing: '0.05em', flexShrink: 0 }}>
      {label}
    </Typography>
    <Box aria-hidden sx={{ flexGrow: 1, borderBottom: 1, borderColor: 'divider' }} />
  </Stack>
);

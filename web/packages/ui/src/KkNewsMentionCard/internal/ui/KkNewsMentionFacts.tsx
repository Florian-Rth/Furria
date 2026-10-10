import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { lineClamp } from '../../../internal/line-clamp';

const LINE_CLAMP = 4;

interface KkNewsMentionFactsProps {
  name: string;
  line: string;
  action: ReactNode;
}

export const KkNewsMentionFacts: FC<KkNewsMentionFactsProps> = ({ name, line, action }) => (
  <Stack sx={{ gap: 0.5, minWidth: 0, alignItems: 'flex-start' }}>
    <Typography variant="h4" component="p" sx={{ hyphens: 'auto' }}>
      {name}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', ...lineClamp(LINE_CLAMP) }}>
      {line}
    </Typography>
    {action}
  </Stack>
);

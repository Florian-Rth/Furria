import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { KkGroupToneDot } from '../../../KkGroupToneDot';
import { kkTokens } from '../../../tokens';
import { GUTTER_WIDTH, ROW_PADDING_X } from './numbered-list-paint';

interface KkNumberedListSectionProps {
  title: string;
  tone?: KkGroupTone | null;
  action?: ReactNode;
}

export const KkNumberedListSection: FC<KkNumberedListSectionProps> = ({ title, tone, action }) => {
  const dot = tone === undefined ? null : <KkGroupToneDot tone={tone} />;

  return (
    <Box component="li" data-kk-numbered-line data-kk-numbered-section sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 0.75,
          minHeight: '2rem',
          pt: 0.5,
          pr: ROW_PADDING_X,
          pl: GUTTER_WIDTH,
        }}
      >
        {dot}
        <Box
          component="span"
          sx={{
            ...kkTokens.eyebrow,
            typography: 'caption',
            fontWeight: 900,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {title}
        </Box>
        <Box component="span" sx={{ flex: 1 }} />
        {action}
      </Stack>
    </Box>
  );
};

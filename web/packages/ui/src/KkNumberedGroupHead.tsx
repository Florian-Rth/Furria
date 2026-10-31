import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { figures, NUMBER_WIDTH } from './KkNumberedList/internal/ui/numbered-list-paint';

interface KkNumberedGroupHeadProps {
  number: string | null;
  title: string;
  trailing?: ReactNode;
}

export const KkNumberedGroupHead: FC<KkNumberedGroupHeadProps> = ({ number, title, trailing }) => {
  return (
    <Stack
      direction="row"
      data-kk-numbered-group-head
      sx={{ alignItems: 'center', gap: 1.25, minWidth: 0, minHeight: '2.25rem' }}
    >
      <Box
        component="span"
        sx={{
          ...figures,
          width: NUMBER_WIDTH,
          flexShrink: 0,
          textAlign: 'right',
          typography: 'h4',
          lineHeight: 1,
          color: number === null ? 'text.disabled' : 'text.primary',
        }}
      >
        {number ?? '–'}
      </Box>
      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          typography: 'subtitle2',
          fontWeight: 800,
          lineHeight: 1.25,
          color: 'text.primary',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Box>
      {trailing}
    </Stack>
  );
};

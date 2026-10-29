import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { figures, NUMBER_WIDTH } from './numbered-list-paint';

const PIN_SIZE = '0.75rem';

interface KkNumberedListNumberProps {
  number: string | null;
  from?: string | null;
  pinned?: boolean;
}

export const KkNumberedListNumber: FC<KkNumberedListNumberProps> = ({
  number,
  from,
  pinned = false,
}) => {
  const previous =
    from === undefined || from === null ? null : (
      <Box
        component="span"
        sx={{
          ...figures,
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1,
          color: 'text.secondary',
          textDecoration: 'line-through',
        }}
      >
        {from}
      </Box>
    );
  const pin = pinned ? (
    <KkIcon name="pinFilled" sx={{ width: PIN_SIZE, height: PIN_SIZE, color: 'text.primary' }} />
  ) : null;

  return (
    <Stack
      component="span"
      data-kk-numbered-number
      sx={{
        flexShrink: 0,
        width: NUMBER_WIDTH,
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 0.25,
      }}
    >
      {previous}
      <Box
        component="span"
        sx={{
          ...figures,
          typography: 'h3',
          lineHeight: 1,
          color: number === null ? 'text.disabled' : 'text.primary',
        }}
      >
        {number ?? '–'}
      </Box>
      {pin}
    </Stack>
  );
};

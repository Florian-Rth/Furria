import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { figures } from './numbered-list-paint';

const BOX_SIZE = '1.375rem';
const GLYPH_SIZE = '1rem';
const NOTE_WIDTH = '3.25rem';

export interface KkListCheck {
  checked: boolean;
  note: string | null;
}

interface KkNumberedListCheckProps {
  check: KkListCheck;
}

export const KkNumberedListCheck: FC<KkNumberedListCheckProps> = ({ check }) => {
  const glyph = check.checked ? (
    <KkIcon name="check" sx={{ width: GLYPH_SIZE, height: GLYPH_SIZE }} />
  ) : null;

  return (
    <Stack
      direction="row"
      component="span"
      data-kk-numbered-check={check.checked ? 'on' : 'off'}
      sx={{ flexShrink: 0, alignItems: 'center', gap: 1 }}
    >
      <Box
        component="span"
        sx={{
          ...figures,
          width: NOTE_WIDTH,
          textAlign: 'right',
          whiteSpace: 'nowrap',
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
        }}
      >
        {check.note}
      </Box>
      <Stack
        component="span"
        aria-hidden
        sx={(theme) => ({
          width: BOX_SIZE,
          height: BOX_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${kkTokens.radius.bar}px`,
          border: 2,
          borderColor: check.checked ? 'primary.main' : 'text.secondary',
          bgcolor: check.checked ? 'primary.main' : 'transparent',
          color: 'primary.contrastText',
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shortest,
          }),
        })}
      >
        {glyph}
      </Stack>
    </Stack>
  );
};

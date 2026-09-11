import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import type { FC, MouseEvent } from 'react';
import type { KkFilterOption } from './filter-chip-entries';
import { toFilterChipEntries } from './filter-chip-entries';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const CHIP_BORDER = 1.5;
const CHIP_SIZE = '0.75rem';

const chipStyles: KkSx = {
  flexShrink: 0,
  minHeight: kkTokens.tapTarget,
  px: 1.75,
  py: 0.75,
  borderWidth: CHIP_BORDER,
  borderStyle: 'solid',
  borderColor: 'divider',
  borderRadius: `${kkTokens.radius.pill}px`,
  fontFamily: kkTokens.font.body,
  fontSize: CHIP_SIZE,
  fontWeight: 800,
  letterSpacing: '0.01em',
  lineHeight: 1.2,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  color: 'text.secondary',
  backgroundColor: 'transparent',
  '&.Mui-selected': {
    color: 'background.paper',
    backgroundColor: 'text.primary',
    borderColor: 'text.primary',
    '&:hover': { backgroundColor: 'text.primary' },
  },
};

interface KkFilterChipsProps {
  label: string;
  options: readonly KkFilterOption[];
  value: string;
  onChange: (id: string) => void;
  sx?: KkSx;
}

export const KkFilterChips: FC<KkFilterChipsProps> = ({ label, options, value, onChange, sx }) => {
  const entries = toFilterChipEntries(options, value);

  const selectEntry = (_event: MouseEvent<HTMLElement>, id: string): void => {
    onChange(id);
  };

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-filter-chips
      sx={[
        {
          alignItems: 'center',
          gap: 0.875,
          minWidth: 0,
          maxWidth: '100%',
          flexWrap: { xs: 'nowrap', desktop: 'wrap' },
          overflowX: { xs: 'auto', desktop: 'visible' },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {entries.map((entry) => (
        <ToggleButton
          key={entry.id}
          value={entry.id}
          selected={entry.selected}
          onChange={selectEntry}
          sx={chipStyles}
        >
          {entry.text}
        </ToggleButton>
      ))}
    </Stack>
  );
};

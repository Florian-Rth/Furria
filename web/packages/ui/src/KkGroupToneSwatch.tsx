import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const SWATCH_SIZE = 44;
const SELECTED_RING = `0 0 0 ${kkTokens.line.page}px`;
const TAKEN_DASH = 'dashed';
const SOLID = 'solid';

interface KkGroupToneSwatchProps {
  tone: KkGroupTone;
  label: string;
  selected: boolean;
  taken?: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkGroupToneSwatch: FC<KkGroupToneSwatchProps> = ({
  tone,
  label,
  selected,
  taken = false,
  onSelect,
  sx,
}) => {
  const mark = selected ? <KkIcon name="check" size="small" /> : null;

  return (
    <Stack
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      data-kk-group-tone-swatch
      sx={[
        (theme) => ({
          width: SWATCH_SIZE,
          height: SWATCH_SIZE,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          appearance: 'none',
          cursor: 'pointer',
          padding: 0,
          borderRadius: `${kkTokens.radius.base}px`,
          borderWidth: kkTokens.line.hair,
          borderStyle: taken ? TAKEN_DASH : SOLID,
          borderColor: 'divider',
          boxShadow: selected
            ? `${SELECTED_RING} ${(theme.vars ?? theme).palette.text.primary}`
            : 'none',
          ...groupToneFieldPaint(theme, tone),
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {mark}
    </Stack>
  );
};

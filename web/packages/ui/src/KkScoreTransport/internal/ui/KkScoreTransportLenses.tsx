import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';

export interface KkScoreLens {
  id: string;
  label: string;
}

interface KkScoreTransportLensesProps {
  label: string;
  lenses: readonly KkScoreLens[];
  value: string;
  onChange: (id: string) => void;
}

export const KkScoreTransportLenses: FC<KkScoreTransportLensesProps> = ({
  label,
  lenses,
  value,
  onChange,
}) => {
  const buttons = lenses.map((lens) => {
    const chosen = lens.id === value;
    const choose = (): void => {
      onChange(lens.id);
    };

    return (
      <ButtonBase
        key={lens.id}
        aria-pressed={chosen}
        data-chosen={chosen}
        onClick={choose}
        sx={(theme) => ({
          minHeight: kkTokens.tapTarget,
          px: 1.25,
          typography: 'caption',
          fontWeight: 800,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          color: 'text.secondary',
          borderRadius: `${kkTokens.radius.bar}px`,
          whiteSpace: 'nowrap',
          ...focusRing(theme),
          '&[data-chosen="true"]': { color: 'text.primary', backgroundColor: inkWash(theme, '9%') },
          '@media (hover: hover)': { '&:hover': { color: 'text.primary' } },
        })}
      >
        {lens.label}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-score-lenses
      sx={{ gap: 0.25, minWidth: 0, flexWrap: 'wrap', ml: 'auto' }}
    >
      {buttons}
    </Stack>
  );
};

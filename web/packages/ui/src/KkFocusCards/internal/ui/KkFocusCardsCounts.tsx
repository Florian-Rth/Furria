import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkFocusCardsCount {
  key: string;
  index: number;
  count: number;
  label: string;
}

export interface KkFocusCardsEight {
  key: string;
  text: string;
  counts: readonly KkFocusCardsCount[];
}

interface KkFocusCardsCountsProps {
  label: string;
  eights: readonly KkFocusCardsEight[];
  current: number;
  onSeek: (index: number) => void;
}

export const KkFocusCardsCounts: FC<KkFocusCardsCountsProps> = ({
  label,
  eights,
  current,
  onSeek,
}) => {
  const groups = eights.map((eight) => {
    const cells = eight.counts.map((cell) => {
      const seek = (): void => {
        onSeek(cell.index);
      };
      const state = cell.index === current ? 'now' : cell.index < current ? 'past' : 'ahead';

      return (
        <ButtonBase
          key={cell.key}
          aria-label={cell.label}
          aria-current={state === 'now' ? 'true' : undefined}
          data-state={state}
          onClick={seek}
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            height: kkTokens.tapTarget,
            borderRadius: `${kkTokens.radius.bar}px`,
            alignItems: 'flex-end',
            pb: 0.25,
            typography: 'caption',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: palette(theme).text.secondary,
            backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
            '&[data-state="past"]': {
              backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 16%, transparent)`,
            },
            '&[data-state="now"]': {
              color: palette(theme).primary.contrastText,
              backgroundColor: palette(theme).primary.main,
            },
            ...focusRing(theme),
          })}
        >
          {cell.count}
        </ButtonBase>
      );
    });

    return (
      <Stack key={eight.key} sx={{ flex: '1 1 3.75rem', minWidth: '3.75rem', gap: 0.25 }}>
        <Typography
          component="span"
          variant="caption"
          sx={{
            lineHeight: 1.1,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {eight.text}
        </Typography>
        <Stack direction="row" sx={{ gap: '1px' }}>
          {cells}
        </Stack>
      </Stack>
    );
  });

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={{ gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}
    >
      {groups}
    </Stack>
  );
};

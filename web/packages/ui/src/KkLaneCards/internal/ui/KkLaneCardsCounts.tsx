import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkLaneCardsCount {
  key: string;
  count: number;
  lit: boolean;
  label: string;
  onSeek: () => void;
}

export interface KkLaneCardsEight {
  key: string;
  text: string;
  cells: readonly KkLaneCardsCount[];
}

interface KkLaneCardsCountsProps {
  label: string;
  empty: string;
  eights: readonly KkLaneCardsEight[];
}

export const KkLaneCardsCounts: FC<KkLaneCardsCountsProps> = ({ label, empty, eights }) => {
  const groups = eights.map((eight) => {
    const cells = eight.cells.map((cell) => (
      <ButtonBase
        key={cell.key}
        aria-label={cell.label}
        aria-current={cell.lit ? 'time' : undefined}
        onClick={cell.onSeek}
        data-lit={cell.lit}
        sx={(theme) => ({
          flex: '1 1 0',
          minWidth: 0,
          height: '2.25rem',
          borderRadius: `${kkTokens.radius.bar}px`,
          color: palette(theme).text.secondary,
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
          '&[data-lit="true"]': {
            color: palette(theme).primary.contrastText,
            backgroundColor: palette(theme).primary.main,
          },
          ...focusRing(theme),
        })}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
        >
          {cell.count}
        </Typography>
      </ButtonBase>
    ));

    return (
      <Stack key={eight.key} sx={{ flex: '1 1 calc(50% - 0.375rem)', minWidth: 0, gap: 0.25 }}>
        <Typography
          variant="caption"
          aria-hidden
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {eight.text}
        </Typography>
        <Stack direction="row" sx={{ gap: 0.25 }}>
          {cells}
        </Stack>
      </Stack>
    );
  });
  const body =
    eights.length === 0 ? (
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 2.5 }}>
        {empty}
      </Typography>
    ) : (
      groups
    );

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={{
        flexShrink: 0,
        flexWrap: 'wrap',
        maxHeight: '7.25rem',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        columnGap: 0.75,
        rowGap: 0.5,
      }}
    >
      {body}
    </Stack>
  );
};

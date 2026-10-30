import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkEightsSheetLabelLane = 'step' | 'video' | 'ways';

interface KkEightsSheetLabelProps {
  lead: string | null;
  text: string | null;
  continues: boolean;
  current: boolean;
  lane: KkEightsSheetLabelLane;
}

export const KkEightsSheetLabel: FC<KkEightsSheetLabelProps> = ({
  lead,
  text,
  continues,
  current,
  lane,
}) => {
  const leadMark =
    lead === null ? null : (
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {lead}
      </Typography>
    );
  const textMark =
    text === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{
          minWidth: 0,
          fontWeight: 700,
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      role="cell"
      data-kk-eights-lane={lane}
      data-continues={continues}
      data-current={current}
      sx={(theme) => ({
        position: 'relative',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        pl: 1.25,
        pr: 0.5,
        color: palette(theme).text.primary,
        '&[data-current="true"]': redInk(theme),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '0.375rem',
          top: 0,
          bottom: 0,
          width: 0,
          borderLeft: `${kkTokens.line.section}px solid transparent`,
        },
        '&[data-continues="true"]::before': { borderLeftColor: palette(theme).divider },
        '&[data-current="true"][data-continues="true"]::before': {
          borderLeftColor: palette(theme).primary.main,
        },
      })}
    >
      {leadMark}
      {textMark}
    </Stack>
  );
};

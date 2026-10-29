import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import type { KkStudioCLaneKind, KkStudioCLaneLabel } from '../../studio-c-types';
import { LABEL_COLUMN, LANE_HEIGHTS } from '../studio-c-lanes';

const labelPaint =
  (kind: KkStudioCLaneKind) =>
  (theme: Theme): CSSObject => ({
    height: theme.spacing(LANE_HEIGHTS[kind]),
    justifyContent: 'center',
    rowGap: 0,
    pr: 0.75,
    minWidth: 0,
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: (theme.vars ?? theme).palette.divider,
  });

const namePaint =
  (kind: KkStudioCLaneKind) =>
  (theme: Theme): CSSObject => ({
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...(kind === 'own' ? redInk(theme) : { color: 'text.secondary' }),
  });

interface KkStudioCTimelineLabelsProps {
  lanes: readonly KkStudioCLaneLabel[];
}

export const KkStudioCTimelineLabels: FC<KkStudioCTimelineLabelsProps> = ({ lanes }) => {
  const rows = lanes.map((lane) => {
    const note =
      lane.note === null ? null : (
        <Typography
          component="span"
          sx={{ typography: 'caption', lineHeight: 1.1, color: 'text.disabled', fontWeight: 600 }}
        >
          {lane.note}
        </Typography>
      );

    return (
      <Stack key={lane.kind} sx={labelPaint(lane.kind)}>
        <Typography component="span" sx={namePaint(lane.kind)}>
          {lane.label}
        </Typography>
        {note}
      </Stack>
    );
  });

  return (
    <Stack
      aria-hidden
      data-kk-studio-c-labels
      sx={(theme) => ({
        width: LABEL_COLUMN,
        flexShrink: 0,
        borderTopWidth: kkTokens.line.section,
        borderTopStyle: 'solid',
        borderTopColor: (theme.vars ?? theme).palette.text.primary,
      })}
    >
      {rows}
    </Stack>
  );
};

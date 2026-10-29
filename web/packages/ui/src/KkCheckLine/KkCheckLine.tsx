import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from '../internal/gold-ink';
import { redInk } from '../internal/red-ink';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';
import type { KkSeverity } from '../KkSeverityGlyph';
import { KkSeverityGlyph } from '../KkSeverityGlyph';
import { KkStateGlyph } from '../KkStatePill/KkStateGlyph';
import { stepFigures, stepStateInk } from '../KkStatePill/state-paint';
import type { KkStepState } from '../KkStatePill/step-state';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const ICON_EXTENT = '1.125rem';
const LABEL_WIDTH = { xs: '6.75rem', sm: '7.5rem' };

const severityInk = (theme: Theme, severity: KkSeverity): CSSObject => {
  switch (severity) {
    case 'conflict':
      return { ...redInk(theme), fontWeight: 700 };
    case 'hint':
      return { ...goldInkOf(theme), fontWeight: 700 };
    case 'met':
      return { color: 'text.primary' };
    case 'off':
      return { color: 'text.secondary' };
  }
};

const stateInk = (theme: Theme, state: KkStepState): CSSObject =>
  state === 'done'
    ? { color: 'text.primary' }
    : { ...stepStateInk(theme, state === 'open' ? 'open' : state), fontWeight: 700 };

const valuePaint =
  (state: KkStepState, severity: KkSeverity | undefined, lines: number | undefined) =>
  (theme: Theme): CSSObject => ({
    ...stepFigures,
    flex: 1,
    minWidth: 0,
    typography: 'body2',
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
    ...(severity === undefined ? stateInk(theme, state) : severityInk(theme, severity)),
    ...(lines === undefined
      ? {}
      : {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }),
  });

interface KkCheckLineProps {
  label: string;
  value: string;
  state: KkStepState;
  severity?: KkSeverity;
  icon?: KkIconName;
  lines?: number;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkCheckLine: FC<KkCheckLineProps> = ({
  label,
  value,
  state,
  severity,
  icon,
  lines,
  action,
  sx,
}) => {
  const actionSlot =
    action === undefined ? null : (
      <Stack direction="row" sx={{ flexShrink: 0, alignItems: 'center' }}>
        {action}
      </Stack>
    );
  const lead =
    icon === undefined ? null : (
      <KkIcon
        name={icon}
        sx={{
          width: ICON_EXTENT,
          height: ICON_EXTENT,
          flexShrink: 0,
          color: state === 'off' ? 'text.disabled' : 'text.secondary',
        }}
      />
    );
  const stepGlyph = state === 'done' ? null : <KkStateGlyph state={state} sx={{ mt: 0.375 }} />;
  const glyph =
    severity === undefined ? (
      stepGlyph
    ) : (
      <KkSeverityGlyph state={severity} size="medium" sx={{ mt: 0.25 }} />
    );

  return (
    <Stack
      direction="row"
      data-kk-check-line={state}
      sx={[
        {
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          py: 0.75,
          borderBottomWidth: kkTokens.line.hair,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          '&:last-of-type': { borderBottomWidth: 0 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {lead}
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          width: LABEL_WIDTH,
          typography: 'body2',
          fontWeight: 800,
          lineHeight: 1.3,
          color: state === 'off' ? 'text.secondary' : 'text.primary',
        }}
      >
        {label}
      </Box>
      <Stack direction="row" sx={{ flex: 1, minWidth: 0, gap: 0.625, alignItems: 'flex-start' }}>
        {glyph}
        <Box component="span" sx={valuePaint(state, severity, lines)}>
          {value}
        </Box>
      </Stack>
      {actionSlot}
    </Stack>
  );
};

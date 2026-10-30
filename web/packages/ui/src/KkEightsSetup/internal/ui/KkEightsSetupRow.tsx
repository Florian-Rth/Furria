import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkEightsSegmentState } from '../../../KkEightsBar/internal/ui/KkEightsBarProgress';
import { KkEightsGlyph } from '../../../KkEightsGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsSetupRowProps {
  number: number;
  text: string;
  meta: string;
  state: KkEightsSegmentState;
  stateText: string;
  action: string | null;
  onAction: () => void;
}

export const KkEightsSetupRow: FC<KkEightsSetupRowProps> = ({
  number,
  text,
  meta,
  state,
  stateText,
  action,
  onAction,
}) => {
  const button =
    action === null ? null : (
      <ButtonBase
        onClick={onAction}
        aria-label={`${text}: ${action}`}
        sx={(theme) => ({
          flexShrink: 0,
          minHeight: kkTokens.tapTarget,
          px: 1.25,
          borderRadius: `${kkTokens.radius.chip}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          ...focusRing(theme),
        })}
      >
        <Typography component="span" variant="body2" sx={{ fontWeight: 800 }}>
          {action}
        </Typography>
      </ButtonBase>
    );

  return (
    <Stack
      direction="row"
      component="li"
      data-state={state}
      sx={(theme) => ({
        alignItems: 'center',
        gap: 1.25,
        minHeight: '3.25rem',
        px: 1.5,
        py: 0.5,
        boxShadow: `inset 0 -${kkTokens.line.hair}px 0 ${palette(theme).divider}`,
        color: palette(theme).text.primary,
        '&[data-state="locked"]': { color: palette(theme).text.secondary },
      })}
    >
      <Typography
        component="span"
        variant="body1"
        sx={{
          fontFamily: kkTokens.font.display,
          fontVariantNumeric: 'tabular-nums',
          width: '1.25rem',
          flexShrink: 0,
        }}
      >
        {number}
      </Typography>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>
          {text}
        </Typography>
        <Typography variant="caption" sx={(theme) => ({ color: palette(theme).text.secondary })}>
          {meta}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          gap: 0.5,
          flexShrink: 0,
          color: palette(theme).text.secondary,
          '[data-state="done"] > &': { color: palette(theme).text.primary },
        })}
      >
        <KkEightsGlyph name={state} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {stateText}
        </Typography>
      </Stack>
      {button}
    </Stack>
  );
};

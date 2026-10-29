import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';
import { kkTokens } from '../../../tokens';

export type KkStudioAManualHeadState = 'current' | 'looped' | 'rest';
export type KkStudioAManualHeadTone = 'part' | 'attention';

export interface KkStudioAManualHeadAction {
  label: string;
  onSelect: () => void;
}

interface KkStudioAManualHeadProps {
  title: string;
  meta: string | null;
  state: KkStudioAManualHeadState;
  tone?: KkStudioAManualHeadTone;
  action?: KkStudioAManualHeadAction;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioAManualHead: FC<KkStudioAManualHeadProps> = ({
  title,
  meta,
  state,
  tone = 'part',
  action,
}) => {
  const looped = state === 'looped';
  const button =
    action === undefined ? null : (
      <ButtonBase
        aria-label={action.label}
        aria-pressed={looped}
        onClick={action.onSelect}
        sx={(theme) => ({
          flexShrink: 0,
          width: '2rem',
          height: '2rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          border: `${kkTokens.line.hair}px solid`,
          typography: 'caption',
          fontWeight: 800,
          ...(looped
            ? {
                borderColor: palette(theme).primary.main,
                backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
                ...redInk(theme),
              }
            : { borderColor: palette(theme).divider, color: palette(theme).text.secondary }),
          ...focusRing(theme),
        })}
      >
        <KkStudioAGlyph name="loop" size="1rem" />
      </ButtonBase>
    );
  const metaLine =
    meta === null ? null : (
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {meta}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-studio-a-manual-head={state}
      sx={(theme) => ({
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        minWidth: 0,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 3%, transparent)`,
      })}
    >
      <Stack direction="row" sx={{ flex: 1, minWidth: 0, alignItems: 'baseline', gap: 1 }}>
        <Typography
          component="h3"
          variant="caption"
          sx={(theme) => ({
            flexShrink: 0,
            fontWeight: kkTokens.eyebrow.fontWeight,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            ...(tone === 'attention' ? goldInkOf(theme) : state === 'rest' ? {} : redInk(theme)),
          })}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      {button}
    </Stack>
  );
};

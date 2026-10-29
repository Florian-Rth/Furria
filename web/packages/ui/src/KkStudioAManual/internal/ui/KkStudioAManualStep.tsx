import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';

export type KkStudioAManualStepState = 'current' | 'looped' | 'rest';
export type KkStudioAManualStepTone = 'timed' | 'attention';

interface KkStudioAManualStepProps {
  number: string;
  title: string;
  facts: string;
  description: string | null;
  thumb?: ReactNode;
  state: KkStudioAManualStepState;
  tone?: KkStudioAManualStepTone;
  actionLabel: string;
  onSelect?: () => void;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioAManualStep: FC<KkStudioAManualStepProps> = ({
  number,
  title,
  facts,
  description,
  thumb,
  state,
  tone = 'timed',
  actionLabel,
  onSelect,
}) => {
  const lit = state !== 'rest';
  const loopMark =
    state === 'looped' ? (
      <KkStudioAGlyph name="loop" size="0.875rem" sx={(theme) => redInk(theme)} />
    ) : null;
  const descriptionLine =
    description === null ? null : (
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35,
        }}
      >
        {description}
      </Typography>
    );

  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      <ButtonBase
        aria-label={actionLabel}
        aria-current={state === 'current' ? 'step' : undefined}
        aria-pressed={state === 'looped'}
        disabled={onSelect === undefined}
        onClick={onSelect}
        data-kk-studio-a-step={state}
        sx={(theme) => ({
          width: '100%',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          textAlign: 'left',
          gap: 1.25,
          px: 1.5,
          py: 1,
          borderTop: `1px solid ${palette(theme).divider}`,
          boxShadow: lit ? `inset 3px 0 0 ${palette(theme).primary.main}` : 'none',
          backgroundColor: lit
            ? `color-mix(in srgb, ${palette(theme).primary.main} ${state === 'looped' ? 9 : 5}%, transparent)`
            : 'transparent',
          transition: 'background-color .2s, box-shadow .2s',
          '&.Mui-disabled': { color: 'inherit' },
          ...focusRing(theme),
        })}
      >
        <Typography
          component="span"
          variant="h3"
          sx={(theme) => ({
            width: '1.75rem',
            flexShrink: 0,
            textAlign: 'right',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            ...(tone === 'attention'
              ? goldInkOf(theme)
              : lit
                ? redInk(theme)
                : { color: palette(theme).text.disabled }),
          })}
        >
          {number}
        </Typography>
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {loopMark}
            <Typography
              component="span"
              variant="caption"
              sx={(theme) => ({
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                ...(tone === 'attention'
                  ? goldInkOf(theme)
                  : { color: palette(theme).text.secondary }),
              })}
            >
              {facts}
            </Typography>
          </Stack>
          {descriptionLine}
        </Stack>
        {thumb}
      </ButtonBase>
    </Box>
  );
};

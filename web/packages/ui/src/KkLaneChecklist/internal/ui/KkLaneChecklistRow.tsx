import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkLaneButton } from '../../../KkLaneButton';
import type { KkLaneGlyphName } from '../../../KkLaneGlyph';
import { KkLaneGlyph } from '../../../KkLaneGlyph';
import { kkTokens } from '../../../tokens';

export type KkLaneChecklistState = 'done' | 'next' | 'open';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const markPaints: Record<KkLaneChecklistState, (theme: Theme) => CSSObject> = {
  done: (theme) => ({
    color: palette(theme).background.paper,
    backgroundColor: palette(theme).text.primary,
  }),
  next: (theme) => ({
    color: palette(theme).primary.main,
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
  }),
  open: (theme) => ({
    color: palette(theme).text.secondary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).text.disabled}`,
  }),
};

interface KkLaneChecklistRowProps {
  index: number;
  state: KkLaneChecklistState;
  stateText: string;
  glyph: KkLaneGlyphName;
  title: string;
  fact: string;
  actionText: string;
  disabled: boolean;
  onAction: () => void;
}

export const KkLaneChecklistRow: FC<KkLaneChecklistRowProps> = ({
  index,
  state,
  stateText,
  glyph,
  title,
  fact,
  actionText,
  disabled,
  onAction,
}) => {
  const mark =
    state === 'done' ? (
      <KkLaneGlyph name="check" />
    ) : (
      <Typography component="span" variant="h4" sx={{ lineHeight: 1, color: 'inherit' }}>
        {index}
      </Typography>
    );

  return (
    <Stack
      component="li"
      direction="row"
      data-state={state}
      sx={(theme) => ({
        alignItems: 'center',
        gap: 1.25,
        py: 1,
        px: 0.5,
        borderBottom: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
      })}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          flexShrink: 0,
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          ...markPaints[state](theme),
        })}
      >
        {mark}
      </Box>
      <Stack sx={{ minWidth: 0, flex: 1, gap: 0.125 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Box aria-hidden sx={{ display: 'grid', color: 'text.secondary' }}>
            <KkLaneGlyph name={glyph} />
          </Box>
          <Typography variant="subtitle2" component="h3" sx={{ lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.2 }}
          >
            {stateText}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}
        >
          {fact}
        </Typography>
      </Stack>
      <KkLaneButton
        text={actionText}
        tone={state === 'next' ? 'accent' : 'quiet'}
        disabled={disabled}
        onPress={onAction}
      />
    </Stack>
  );
};

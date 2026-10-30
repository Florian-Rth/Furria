import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkFocusPopRowState = 'done' | 'next' | 'later' | 'plain';

interface KkFocusPopRowProps {
  lead: string | number;
  text: string;
  meta?: string;
  state: KkFocusPopRowState;
  onPress?: () => void;
}

export const KkFocusPopRow: FC<KkFocusPopRowProps> = ({ lead, text, meta, state, onPress }) => {
  const mark = state === 'done' ? <KkFocusGlyph name="check" /> : lead;
  const metaLine =
    meta === undefined ? null : (
      <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
        {meta}
      </Typography>
    );

  return (
    <ButtonBase
      disabled={onPress === undefined}
      onClick={onPress}
      data-state={state}
      sx={(theme) => ({
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 1,
        minHeight: kkTokens.tapTarget,
        px: 1,
        py: 0.5,
        borderRadius: `${kkTokens.radius.base - 6}px`,
        color: palette(theme).text.primary,
        '&:hover': { backgroundColor: palette(theme).action.hover },
        '&.Mui-disabled': { color: palette(theme).text.primary },
        '&[data-state="later"]': { color: palette(theme).text.secondary },
        ...focusRing(theme),
      })}
    >
      <Stack
        aria-hidden
        data-state={state}
        sx={(theme) => ({
          flex: 'none',
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          typography: 'caption',
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          '&[data-state="next"]': {
            backgroundColor: palette(theme).primary.main,
            color: palette(theme).primary.contrastText,
            boxShadow: 'none',
          },
          '&[data-state="done"]': {
            backgroundColor: palette(theme).text.primary,
            color: palette(theme).background.paper,
            boxShadow: 'none',
          },
        })}
      >
        {mark}
      </Stack>
      <Stack sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: state === 'next' ? 800 : 600 }}
        >
          {text}
        </Typography>
        {metaLine}
      </Stack>
    </ButtonBase>
  );
};

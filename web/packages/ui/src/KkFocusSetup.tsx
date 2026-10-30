import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkFocusSetupState = 'next' | 'later';

interface KkFocusSetupProps {
  number: number;
  text: string;
  hint: string;
  state: KkFocusSetupState;
  onPress: () => void;
}

export const KkFocusSetup: FC<KkFocusSetupProps> = ({ number, text, hint, state, onPress }) => (
  <ButtonBase
    onClick={onPress}
    aria-label={`${number} · ${text}. ${hint}`}
    data-kk-focus-setup={state}
    sx={(theme) => ({
      gap: 1,
      minHeight: kkTokens.tapTarget,
      maxWidth: '100%',
      px: 1.25,
      py: 0.5,
      borderRadius: `${kkTokens.radius.chip}px`,
      color: palette(theme).text.secondary,
      backgroundColor: palette(theme).background.paper,
      border: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
      '&[data-kk-focus-setup="next"]': {
        color: palette(theme).primary.contrastText,
        backgroundColor: palette(theme).primary.main,
        border: `${kkTokens.line.hair}px solid ${palette(theme).primary.main}`,
        boxShadow: kkTokens.shadow.floating,
      },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="subtitle2"
      sx={{
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontVariantNumeric: 'tabular-nums',
        color: 'inherit',
      }}
    >
      {number}
    </Typography>
    <Stack sx={{ minWidth: 0, alignItems: 'flex-start' }}>
      <Typography
        component="span"
        variant="caption"
        sx={{ fontWeight: 800, color: 'inherit', lineHeight: 1.25, textAlign: 'left' }}
      >
        {text}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{ color: 'inherit', opacity: 0.8, lineHeight: 1.25, textAlign: 'left' }}
      >
        {hint}
      </Typography>
    </Stack>
  </ButtonBase>
);

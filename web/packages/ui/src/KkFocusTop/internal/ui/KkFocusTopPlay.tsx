import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusTopPlayProps {
  playing: boolean;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

export const KkFocusTopPlay: FC<KkFocusTopPlayProps> = ({ playing, label, disabled, onPress }) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={playing}
    disabled={disabled}
    onClick={onPress}
    sx={(theme) => ({
      flex: 'none',
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      borderRadius: '50%',
      color: palette(theme).primary.contrastText,
      backgroundColor: palette(theme).primary.main,
      '&.Mui-disabled': {
        color: palette(theme).text.disabled,
        backgroundColor: palette(theme).action.disabledBackground,
      },
      ...focusRing(theme),
    })}
  >
    <KkFocusGlyph name={playing ? 'pause' : 'play'} />
  </ButtonBase>
);

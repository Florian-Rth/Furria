import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesKeyProps {
  share: number;
  label: string;
  moving: boolean;
  onPress: () => void;
}

export const KkFocusLanesKey: FC<KkFocusLanesKeyProps> = ({ share, label, moving, onPress }) => (
  <ButtonBase
    aria-label={label}
    onClick={onPress}
    data-moving={moving}
    style={{ left: `${share * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '1.25rem',
      transform: 'translateX(-50%)',
      '&::after': {
        content: '""',
        width: '0.625rem',
        height: '0.625rem',
        transform: 'rotate(45deg)',
        borderRadius: `${kkTokens.radius.bar / 2}px`,
        backgroundColor: palette(theme).text.primary,
        boxShadow: `0 0 0 ${kkTokens.line.hair}px ${palette(theme).background.paper}`,
      },
      '&[data-moving="true"]::after': {
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
      },
      ...focusRing(theme),
    })}
  />
);

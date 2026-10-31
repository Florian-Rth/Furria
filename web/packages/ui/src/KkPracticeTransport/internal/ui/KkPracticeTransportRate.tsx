import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const ratePaint =
  (slowed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    width: '3.75rem',
    height: kkTokens.tapTarget,
    borderRadius: `${kkTokens.radius.pill}px`,
    ...theme.typography.subtitle2,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: (theme.vars ?? theme).palette.text.secondary,
    transition: kkTokens.motion.press,
    '&:active': { transform: 'scale(0.94)' },
    ...(slowed ? redInk(theme) : {}),
    ...focusRing(theme),
  });

interface KkPracticeTransportRateProps {
  text: string;
  label: string;
  slowed: boolean;
  onPress: () => void;
}

export const KkPracticeTransportRate: FC<KkPracticeTransportRateProps> = ({
  text,
  label,
  slowed,
  onPress,
}) => (
  <ButtonBase aria-label={label} onClick={onPress} data-kk-practice-rate sx={ratePaint(slowed)}>
    {text}
  </ButtonBase>
);

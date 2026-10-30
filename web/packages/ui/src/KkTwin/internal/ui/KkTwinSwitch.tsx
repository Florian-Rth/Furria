import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { TWIN_ROOMY } from '../twin-query';

interface KkTwinSwitchProps {
  text: string;
  label: string;
  onPress: () => void;
}

export const KkTwinSwitch: FC<KkTwinSwitchProps> = ({ text, label, onPress }) => (
  <ButtonBase
    aria-label={label}
    onClick={onPress}
    data-kk-twin-switch
    sx={(theme) => ({
      flexShrink: 0,
      gap: 0.75,
      height: kkTokens.tapTarget,
      minWidth: kkTokens.tapTarget,
      px: 1.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: (theme.vars ?? theme).palette.text.primary,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.96)' },
      ...focusRing(theme),
    })}
  >
    <GroupsRoundedIcon fontSize="small" />
    <Typography
      component="span"
      variant="caption"
      aria-hidden
      sx={{ display: 'none', fontWeight: 800, [TWIN_ROOMY]: { display: 'inline' } }}
    >
      {text}
    </Typography>
  </ButtonBase>
);

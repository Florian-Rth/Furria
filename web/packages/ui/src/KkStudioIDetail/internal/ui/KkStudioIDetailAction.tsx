import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioIDetailActionProps {
  text: string;
  disabled: boolean;
  onPress: () => void;
}

export const KkStudioIDetailAction: FC<KkStudioIDetailActionProps> = ({
  text,
  disabled,
  onPress,
}) => (
  <ButtonBase
    disabled={disabled}
    onClick={onPress}
    data-kk-studio-i-detail-action
    sx={(theme) => ({
      alignSelf: 'flex-start',
      flexShrink: 0,
      minHeight: '2.25rem',
      px: 1.5,
      borderRadius: `${kkTokens.radius.pill}px`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      '&.Mui-disabled': { opacity: 0.45 },
      ...focusRing(theme),
    })}
  >
    <Typography component="span" variant="button">
      {text}
    </Typography>
  </ButtonBase>
);

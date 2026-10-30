import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListActionProps {
  icon: KkIconName;
  text: string;
  disabled: boolean;
  onPress: () => void;
}

export const KkStudioListAction: FC<KkStudioListActionProps> = ({
  icon,
  text,
  disabled,
  onPress,
}) => (
  <ButtonBase
    disabled={disabled}
    onClick={onPress}
    data-kk-studio-list-action
    sx={(theme) => ({
      flexShrink: 0,
      justifyContent: 'flex-start',
      gap: 1,
      minHeight: '3rem',
      mx: 0.5,
      px: 1.25,
      borderRadius: `${kkTokens.radius.base - 4}px`,
      color: palette(theme).text.primary,
      border: `${kkTokens.line.hair}px dashed ${palette(theme).text.secondary}`,
      transition: 'background-color 160ms ease-out',
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
      },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      ...focusRing(theme),
    })}
  >
    <KkIcon name={icon} size="small" />
    <Typography component="span" variant="subtitle2" sx={{ color: 'inherit' }}>
      {text}
    </Typography>
  </ButtonBase>
);

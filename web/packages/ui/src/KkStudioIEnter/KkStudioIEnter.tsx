import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';

interface KkStudioIEnterProps {
  text: string;
  label: string;
  onPress: () => void;
}

export const KkStudioIEnter: FC<KkStudioIEnterProps> = ({ text, label, onPress }) => (
  <ButtonBase
    aria-label={label}
    onClick={onPress}
    data-kk-studio-i-enter
    sx={(theme) => ({
      flexShrink: 0,
      gap: 0.75,
      height: '2.25rem',
      px: 1.5,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: (theme.vars ?? theme).palette.text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      '&:hover': { backgroundColor: (theme.vars ?? theme).palette.action.hover },
      ...focusRing(theme),
    })}
  >
    <EditOutlinedIcon fontSize="small" />
    <Typography component="span" variant="button">
      {text}
    </Typography>
  </ButtonBase>
);

import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';

interface KkBannerToolProps {
  icon: KkIconName;
  label: string;
  tone?: 'default' | 'danger';
  isLabelShown?: boolean;
  onClick: () => void;
}

export const KkBannerTool: FC<KkBannerToolProps> = ({
  icon,
  label,
  tone = 'default',
  isLabelShown = true,
  onClick,
}) => {
  const word = isLabelShown ? (
    <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>
      {label}
    </Typography>
  ) : null;

  return (
    <ButtonBase
      aria-label={label}
      onClick={onClick}
      sx={(theme) => ({
        gap: 0.5,
        minHeight: 36,
        minWidth: 36,
        px: isLabelShown ? 1.25 : 0.75,
        borderRadius: 0.75,
        color: tone === 'danger' ? 'error.contrastText' : 'text.primary',
        bgcolor: tone === 'danger' ? 'error.main' : 'transparent',
        '@media (hover: hover)': {
          '&:hover': { bgcolor: tone === 'danger' ? 'error.dark' : 'action.hover' },
        },
        ...focusRing(theme),
      })}
    >
      <KkIcon name={icon} size="small" />
      {word}
    </ButtonBase>
  );
};

import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioIClipBadgeProps {
  text: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const KkStudioIClipBadge: FC<KkStudioIClipBadgeProps> = ({
  text,
  label,
  selected,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={selected}
    onClick={onPress}
    data-kk-studio-i-clip-badge
    sx={(theme) => ({
      position: 'absolute',
      left: '0.5rem',
      top: '0.5rem',
      zIndex: 2,
      gap: 0.5,
      height: '1.75rem',
      px: 1,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: kkTokens.overlay.onPhotoText,
      backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 64%, transparent)`,
      boxShadow: selected
        ? `inset 0 0 0 ${kkTokens.line.section}px ${kkTokens.overlay.onPhotoText}`
        : 'none',
      backdropFilter: 'blur(6px)',
      ...focusRing(theme),
    })}
  >
    <VideocamRoundedIcon fontSize="small" />
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </Typography>
  </ButtonBase>
);

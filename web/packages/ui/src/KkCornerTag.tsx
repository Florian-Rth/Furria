import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { safeAreaInset } from './internal/safe-area';
import { KkBroomMark } from './KkBroomMark';
import { kkTokens } from './tokens';

const MARK_SIZE = 14;
const EDGE_HEIGHT = '42%';

interface KkCornerTagProps {
  label: string;
  ariaLabel: string;
  onPress: () => void;
}

export const KkCornerTag: FC<KkCornerTagProps> = ({ label, ariaLabel, onPress }) => (
  <ButtonBase
    aria-label={ariaLabel}
    onClick={onPress}
    data-kk-corner-tag
    sx={(theme) => ({
      position: 'fixed',
      zIndex: theme.zIndex.tooltip + 1,
      top: EDGE_HEIGHT,
      left: safeAreaInset('left'),
      flexDirection: 'column',
      rowGap: 0.5,
      px: 0.375,
      py: 1,
      borderRadius: `0 ${kkTokens.radius.base}px ${kkTokens.radius.base}px 0`,
      bgcolor: 'warning.main',
      color: kkTokens.color.light.onyx,
      boxShadow: kkTokens.shadow.floating,
      ...focusRing(theme),
    })}
  >
    <KkBroomMark size={MARK_SIZE} />
    <Typography
      variant="caption"
      component="span"
      sx={{
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: kkTokens.type.tracking.label,
        textTransform: 'uppercase',
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
      }}
    >
      {label}
    </Typography>
  </ButtonBase>
);

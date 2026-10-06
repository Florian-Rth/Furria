import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { navLabelPose } from '../logic/nav-motion';

const SNUG_ITEM = '@container kk-shell-nav-item (max-width: 5.25rem)';
const NARROW_ITEM = '@container kk-shell-nav-item (max-width: 3.5rem)';

const LABEL_PAINT: CSSObject = {
  typography: 'caption',
  fontWeight: kkTokens.eyebrow.fontWeight,
  letterSpacing: kkTokens.type.tracking.label,
  lineHeight: 1,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  minWidth: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: kkTokens.motion.label,
  [SNUG_ITEM]: {
    letterSpacing: kkTokens.type.tracking.tight,
    textTransform: 'none',
  },
  [NARROW_ITEM]: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    clipPath: 'inset(50%)',
  },
};

interface KkShellNavLabelProps extends PropsWithChildren {
  active: boolean;
}

export const KkShellNavLabel: FC<KkShellNavLabelProps> = ({ active, children }) => {
  const pose = navLabelPose(active);
  const labelPaint: CSSObject = {
    ...LABEL_PAINT,
    color: active ? 'text.primary' : 'text.secondary',
    opacity: pose.opacity,
    transform: `translateY(${pose.y}px)`,
  };

  return (
    <Typography component="span" data-kk-shell-nav-label sx={labelPaint}>
      {children}
    </Typography>
  );
};

import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { navLabelPose } from '../logic/nav-motion';

const LABEL_PAINT: CSSObject = {
  typography: 'caption',
  fontWeight: kkTokens.eyebrow.fontWeight,
  letterSpacing: kkTokens.type.tracking.label,
  lineHeight: 1,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  minWidth: 0,
  transition: kkTokens.motion.label,
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

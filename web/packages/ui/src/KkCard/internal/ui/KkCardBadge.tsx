import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

type KkCardBadgeCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface KkCardBadgeProps extends PropsWithChildren {
  corner?: KkCardBadgeCorner;
}

interface BadgeCornerStyle {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
  borderTopWidth: number;
  borderRightWidth: number;
  borderBottomWidth: number;
  borderLeftWidth: number;
}

const outer = kkTokens.radius.base;
const hair = kkTokens.line.hair;

const cornerStyles: Record<KkCardBadgeCorner, BadgeCornerStyle> = {
  topLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: outer,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: outer,
    borderTopWidth: 0,
    borderRightWidth: hair,
    borderBottomWidth: hair,
    borderLeftWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: outer,
    borderBottomLeftRadius: outer,
    borderBottomRightRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: hair,
    borderLeftWidth: hair,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: outer,
    borderBottomLeftRadius: outer,
    borderBottomRightRadius: 0,
    borderTopWidth: hair,
    borderRightWidth: hair,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopLeftRadius: outer,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: outer,
    borderTopWidth: hair,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: hair,
  },
};

export const KkCardBadge: FC<KkCardBadgeProps> = ({ corner = 'topLeft', children }) => (
  <Box
    data-kk-card-badge
    sx={{
      position: 'absolute',
      zIndex: 1,
      maxWidth: 'calc(100% - 2rem)',
      bgcolor: 'background.paper',
      color: 'primary.main',
      fontFamily: kkTokens.font.display,
      fontSize: '1.125rem',
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      px: 1.25,
      py: 0.75,
      borderStyle: 'solid',
      borderColor: 'divider',
      ...cornerStyles[corner],
    }}
  >
    {children}
  </Box>
);

import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { displayLineClamp } from '../../../internal/line-clamp';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

export type KkBulletinTitleSize = 'regular' | 'compact';

const VARIANTS = { regular: 'h3', compact: 'h4' } as const;
const LINES: Record<KkBulletinTitleSize, number> = { regular: 2, compact: 2 };

interface KkBulletinTitleProps extends PropsWithChildren {
  size?: KkBulletinTitleSize;
  component?: 'h2' | 'h3';
  sx?: KkSx;
}

export const KkBulletinTitle: FC<KkBulletinTitleProps> = ({
  size = 'regular',
  component = 'h3',
  sx,
  children,
}) => (
  <Typography
    component={component}
    variant={VARIANTS[size]}
    data-kk-heading
    sx={[
      {
        m: 0,
        letterSpacing: kkTokens.type.tracking.display,
        overflowWrap: 'anywhere',
        ...displayLineClamp(LINES[size]),
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);

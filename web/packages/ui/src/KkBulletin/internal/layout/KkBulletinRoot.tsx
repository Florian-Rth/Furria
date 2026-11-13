import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { KkPanel } from '../../../KkPanel';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkBulletinMark } from '../../bulletin';

const EDGE_WIDTH = '0.25rem';
const EDGE_INSET = '0.875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const edgeColorOf = (theme: Theme, mark: KkBulletinMark): string => {
  switch (mark) {
    case 'owed':
      return palette(theme).info.main;
    case 'new':
      return palette(theme).primary.main;
    case 'none':
      return 'transparent';
  }
};

const edgePaint =
  (mark: KkBulletinMark) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    gap: 1.25,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: `calc(-1 * ${kkTokens.line.hair}px)`,
      top: EDGE_INSET,
      bottom: EDGE_INSET,
      width: EDGE_WIDTH,
      borderRadius: `0 ${kkTokens.radius.bar}px ${kkTokens.radius.bar}px 0`,
      backgroundColor: edgeColorOf(theme, mark),
    },
  });

interface KkBulletinRootProps extends PropsWithChildren {
  mark?: KkBulletinMark;
  dimmed?: boolean;
  highlight?: boolean;
  landing?: string;
  onSelect?: () => void;
  sx?: KkSx;
}

export const KkBulletinRoot: FC<KkBulletinRootProps> = ({
  mark = 'none',
  dimmed = false,
  highlight = false,
  landing,
  onSelect,
  sx,
  children,
}) => (
  <KkPanel
    variant="block"
    chevron={false}
    dimmed={dimmed}
    highlight={highlight}
    landing={landing}
    onClick={onSelect}
    sx={[edgePaint(mark), ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </KkPanel>
);

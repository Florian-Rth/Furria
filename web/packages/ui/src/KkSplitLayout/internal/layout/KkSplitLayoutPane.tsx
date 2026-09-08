import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useIsMobile } from '../../../use-is-mobile';
import { KkSplitLayoutColumn } from './KkSplitLayoutColumn';
import { KkSplitLayoutSheet } from './KkSplitLayoutSheet';

interface KkSplitLayoutPaneProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkSplitLayoutPane: FC<KkSplitLayoutPaneProps> = ({ sx, children }) => {
  const isMobile = useIsMobile();
  const Pane = isMobile ? KkSplitLayoutSheet : KkSplitLayoutColumn;

  return <Pane sx={sx}>{children}</Pane>;
};

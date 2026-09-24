import type { FC, PropsWithChildren } from 'react';
import { highlightHoldPaint } from '../../../internal/highlight-paint';
import { KkPanel } from '../../../KkPanel';
import { KkPanelSection } from '../../../KkPanelSection';

interface KkWriteScreenChainProps extends PropsWithChildren {
  title: string;
}

export const KkWriteScreenChain: FC<KkWriteScreenChainProps> = ({ title, children }) => (
  <KkPanelSection title={title}>
    <KkPanel variant="list" sx={highlightHoldPaint}>
      {children}
    </KkPanel>
  </KkPanelSection>
);

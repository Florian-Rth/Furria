import type { FC, PropsWithChildren } from 'react';
import { KkPanel } from './KkPanel';
import { KkPanelSection } from './KkPanelSection';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const FIELDS_SX = { gap: kkTokens.form.fieldGap } as const;

interface KkFormSectionProps extends PropsWithChildren {
  title: string;
  sx?: KkSx;
}

export const KkFormSection: FC<KkFormSectionProps> = ({ title, sx, children }) => (
  <KkPanelSection title={title} sx={sx}>
    <KkPanel variant="block" tone="raised" sx={FIELDS_SX}>
      {children}
    </KkPanel>
  </KkPanelSection>
);

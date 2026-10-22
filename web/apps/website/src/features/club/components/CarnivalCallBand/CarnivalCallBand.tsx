import { KkBandSection } from '@furria/ui/KkBandSection';
import { KkBandWatermark } from '@furria/ui/KkBandWatermark';
import type { FC } from 'react';
import { CarnivalCallCopy } from './internal/ui/CarnivalCallCopy';
import { CarnivalCallShout } from './internal/ui/CarnivalCallShout';

export const CarnivalCallBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark side="left" />}>
    <KkBandSection.Row>
      <CarnivalCallCopy />
      <CarnivalCallShout />
    </KkBandSection.Row>
  </KkBandSection>
);

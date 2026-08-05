import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { JoinClosingCopy } from './internal/ui/JoinClosingCopy';
import { JoinClosingCta } from './internal/ui/JoinClosingCta';

export const JoinClosingBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <JoinClosingCopy />
      <JoinClosingCta />
    </KkBandSection.Row>
  </KkBandSection>
);

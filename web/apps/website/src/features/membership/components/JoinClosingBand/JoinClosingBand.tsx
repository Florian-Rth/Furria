import { KkBandSection } from '@furria/ui';
import type { FC } from 'react';
import { JoinClosingCopy } from './internal/ui/JoinClosingCopy';
import { JoinClosingCta } from './internal/ui/JoinClosingCta';
import { JoinClosingWatermark } from './internal/ui/JoinClosingWatermark';

export const JoinClosingBand: FC = () => (
  <KkBandSection decoration={<JoinClosingWatermark />}>
    <KkBandSection.Row>
      <JoinClosingCopy />
      <JoinClosingCta />
    </KkBandSection.Row>
  </KkBandSection>
);

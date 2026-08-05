import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { NarrenrufCopy } from './internal/ui/NarrenrufCopy';
import { NarrenrufShout } from './internal/ui/NarrenrufShout';

export const NarrenrufBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark side="left" />}>
    <KkBandSection.Row>
      <NarrenrufCopy />
      <NarrenrufShout />
    </KkBandSection.Row>
  </KkBandSection>
);

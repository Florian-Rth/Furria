import { KkBandSection } from '@furria/ui';
import type { FC } from 'react';
import { NarrenrufCopy } from './internal/ui/NarrenrufCopy';
import { NarrenrufShout } from './internal/ui/NarrenrufShout';
import { NarrenrufWatermark } from './internal/ui/NarrenrufWatermark';

export const NarrenrufBand: FC = () => (
  <KkBandSection decoration={<NarrenrufWatermark />}>
    <KkBandSection.Row>
      <NarrenrufCopy />
      <NarrenrufShout />
    </KkBandSection.Row>
  </KkBandSection>
);

import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { NewsProgramCopy } from './internal/ui/NewsProgramCopy';
import { NewsProgramCta } from './internal/ui/NewsProgramCta';

export const NewsProgramBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <NewsProgramCopy />
      <NewsProgramCta />
    </KkBandSection.Row>
  </KkBandSection>
);

import { KkBandSection } from '@furria/ui';
import type { FC } from 'react';
import { NewsProgramCopy } from './internal/ui/NewsProgramCopy';
import { NewsProgramCta } from './internal/ui/NewsProgramCta';
import { NewsProgramWatermark } from './internal/ui/NewsProgramWatermark';

export const NewsProgramBand: FC = () => (
  <KkBandSection decoration={<NewsProgramWatermark />}>
    <KkBandSection.Row>
      <NewsProgramCopy />
      <NewsProgramCta />
    </KkBandSection.Row>
  </KkBandSection>
);

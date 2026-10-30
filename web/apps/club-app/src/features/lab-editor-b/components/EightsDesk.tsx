import { KkEightsFrame } from '@furria/ui/KkEightsFrame';
import type { FC } from 'react';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsDeskBar } from './EightsDeskBar';
import { EightsSheetView } from './EightsSheetView';
import { EightsStagePanel } from './EightsStagePanel';
import { EightsStepStrip } from './EightsStepStrip';

interface EightsDeskProps {
  eights: EightsStudio;
}

export const EightsDesk: FC<EightsDeskProps> = ({ eights }) => (
  <>
    <KkEightsFrame.Area area="bar">
      <EightsDeskBar eights={eights} />
    </KkEightsFrame.Area>
    <KkEightsFrame.Area area="main">
      <EightsSheetView eights={eights} />
    </KkEightsFrame.Area>
    <KkEightsFrame.Area area="side">
      <EightsStepStrip eights={eights} />
      <EightsStagePanel eights={eights} counts />
    </KkEightsFrame.Area>
  </>
);

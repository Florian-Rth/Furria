import { KkEightsFrame } from '@furria/ui/KkEightsFrame';
import type { FC } from 'react';
import type { EightsMusicTab } from '../hooks/use-eights-routes';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsSetupView } from './EightsSetupView';

interface EightsSetupScreenProps {
  eights: EightsStudio;
  openMusic: (tab: EightsMusicTab) => void;
}

const stay = (): void => undefined;

export const EightsSetupScreen: FC<EightsSetupScreenProps> = ({ eights, openMusic }) => (
  <KkEightsFrame.Area area="main">
    <EightsSetupView eights={eights} openMusic={openMusic} close={stay} />
  </KkEightsFrame.Area>
);

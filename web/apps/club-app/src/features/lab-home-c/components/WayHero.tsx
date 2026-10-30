import { KkWayKeys } from '@furria/ui/KkWayKeys';
import { KkWayStage } from '@furria/ui/KkWayStage';
import type { FC } from 'react';
import { PRACTICE_FRONT } from '@/features/act-practice/practice-copy';
import type { WayScreen } from '../hooks/use-way-screen';
import { WAY_NEAR_LABEL, WAY_WHOLE_LABEL } from '../way-copy';
import { WayPip } from './WayPip';
import { WayStageLive } from './WayStageLive';

interface WayHeroProps {
  screen: WayScreen;
  floatingVideo: boolean;
}

export const WayHero: FC<WayHeroProps> = ({ screen, floatingVideo }) => {
  const { stage } = screen.playback;
  const lensLabel = screen.near ? WAY_NEAR_LABEL : WAY_WHOLE_LABEL;
  const pip = floatingVideo ? <WayPip screen={screen} docked={false} /> : null;

  return (
    <>
      <KkWayStage
        frontLabel={PRACTICE_FRONT}
        widthMetres={stage.widthMetres}
        depthMetres={stage.depthMetres}
      >
        <WayStageLive screen={screen} />
        <KkWayStage.Corner>
          <KkWayKeys.Lens
            near={screen.near}
            label={lensLabel}
            disabled={!screen.canFollow}
            onPress={screen.toggleNear}
          />
        </KkWayStage.Corner>
      </KkWayStage>
      {pip}
    </>
  );
};

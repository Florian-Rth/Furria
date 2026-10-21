import { KkConfettiGlobe, KkPosterBackdrop, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, START_SECTION, START_TITLE } from '@/features/session';
import { useStartScreen } from '../hooks/use-start-screen';
import { StartBody } from './StartBody';
import { StartHeader } from './StartHeader';
import { WeekStrip } from './WeekStrip';

const STAYING_HEADER = 'banner';

export const StartScreen: FC = () => {
  const { view, focus, cells, look, globe, loading, showsBoard } = useStartScreen();
  const strip = cells === null ? null : <WeekStrip cells={cells} />;
  const foot = showsBoard ? (
    <KkPosterBackdrop.Foot phase={look.phase} runUp={look.runUp} evening={look.evening} />
  ) : null;

  return (
    <KkPosterBackdrop
      phase={look.phase}
      runUp={look.runUp}
      evening={look.evening}
      foil={look.foil}
      held={loading}
    >
      <KkScreen
        kind="overview"
        section={START_SECTION}
        title={START_TITLE}
        header={<StartHeader strip={strip} onCountPress={globe.requestMotion} />}
        headerKind={STAYING_HEADER}
        handover={AREA_HANDOVERS.start}
      >
        <StartBody view={view} focusedDay={focus.focusedDay} strip={strip} />
      </KkScreen>
      {foot}
      <KkConfettiGlobe feed={globe.feed} still={globe.still} />
    </KkPosterBackdrop>
  );
};

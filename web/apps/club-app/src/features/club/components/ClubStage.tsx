import { KkMottoStage } from '@furria/ui';
import type { FC } from 'react';
import {
  daysUntilOpening,
  mottoStageStateAt,
  relevantSessionYear,
  sessionProgressAt,
} from '@/lib/club';
import { formatSessionLabel } from '@/lib/membership-labels';
import { useClubHubQuery } from '../api';
import { MOTTO_PENDING_LABEL, toCountdownLabel, toNumberLabel } from '../club-labels';
import { sceneForSession } from '../stages/stage-registry';

export const ClubStage: FC = () => {
  const clubHub = useClubHubQuery();
  const now = new Date();
  const relevantStartYear = relevantSessionYear(now);
  const session = clubHub.data?.session;
  const motto = session?.motto ?? null;
  const state = mottoStageStateAt(now, relevantStartYear, motto !== null);
  const isRunning = state === 'running';
  const sessionLabel = formatSessionLabel(relevantStartYear);
  const numberLabel = toNumberLabel(session?.number ?? null);
  const countdownLabel = isRunning
    ? null
    : toCountdownLabel(daysUntilOpening(now, relevantStartYear));
  const progress = isRunning ? sessionProgressAt(now) : null;
  const logo = session?.logoSvg ?? null;
  const Scene = sceneForSession(relevantStartYear);

  const scene =
    Scene === undefined ? null : (
      <KkMottoStage.Scene>
        <Scene />
      </KkMottoStage.Scene>
    );

  return (
    <KkMottoStage
      state={state}
      sessionLabel={sessionLabel}
      motto={motto}
      mottoPendingLabel={MOTTO_PENDING_LABEL}
      numberLabel={numberLabel}
      countdownLabel={countdownLabel}
      progress={progress}
      logo={logo}
    >
      {scene}
    </KkMottoStage>
  );
};

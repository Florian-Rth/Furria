import { KkMottoStage } from '@furria/ui/KkMottoStage';
import { KkMottoStageSkeleton } from '@furria/ui/KkMottoStageSkeleton';
import type { FC } from 'react';
import {
  daysUntilOpening,
  mottoStageStateAt,
  relevantSessionYear,
  sessionProgressAt,
} from '@/lib/club';
import { formatSessionLabel } from '@/lib/membership-labels';
import { toSessionLogoImage } from '@/lib/session-logo-image';
import { useClubHubQuery } from '../api';
import {
  MOTTO_PENDING_LABEL,
  MOTTO_UNLOADED_LABEL,
  toCountdownLabel,
  toNumberLabel,
} from '../club-labels';
import { sceneForSession } from '../stages/stage-registry';

const LOGO_SIZES = '(min-width: 900px) 56vw, 74vw';

export const ClubStage: FC = () => {
  const clubHub = useClubHubQuery();
  const now = new Date();
  const relevantStartYear = relevantSessionYear(now);
  const sessionLabel = formatSessionLabel(relevantStartYear);

  if (clubHub.data === undefined && clubHub.isError) {
    return (
      <KkMottoStage
        state="resting"
        sessionLabel={sessionLabel}
        motto={null}
        mottoPendingLabel={MOTTO_UNLOADED_LABEL}
        numberLabel={null}
        countdownLabel={null}
        progress={null}
        logo={null}
      />
    );
  }
  if (clubHub.data === undefined) {
    return <KkMottoStageSkeleton />;
  }

  const session = clubHub.data.session;
  const motto = session.motto;
  const state = mottoStageStateAt(now, relevantStartYear, motto !== null);
  const isRunning = state === 'running';
  const numberLabel = toNumberLabel(session.number);
  const countdownLabel = isRunning
    ? null
    : toCountdownLabel(daysUntilOpening(now, relevantStartYear));
  const progress = isRunning ? sessionProgressAt(now) : null;
  const logo = toSessionLogoImage(session.logo, LOGO_SIZES);
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

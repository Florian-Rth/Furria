import { KkAlert, KkNote, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { IN_PERSON_VALIDITY_NOTE } from '../account-access-labels';
import type { InPersonPhase } from '../in-person-phase';
import { InPersonCodeCard } from './InPersonCodeCard';
import { InPersonRedeemed } from './InPersonRedeemed';

const SKELETON_LINES = 6;
const EXPIRED_SECONDS = 0;

interface InPersonBodyProps {
  phase: InPersonPhase;
  firstName: string;
  rejection: string | null;
}

export const InPersonBody: FC<InPersonBodyProps> = ({ phase, firstName, rejection }) => {
  if (phase.kind === 'redeemed') {
    return <InPersonRedeemed firstName={firstName} />;
  }
  if (phase.kind === 'failed') {
    return <KkAlert severity="error">{rejection}</KkAlert>;
  }
  if (phase.kind === 'expired') {
    return (
      <InPersonCodeCard
        invitation={phase.invitation}
        firstName={firstName}
        secondsLeft={EXPIRED_SECONDS}
      />
    );
  }
  if (phase.kind === 'showing') {
    return (
      <>
        <InPersonCodeCard
          invitation={phase.invitation}
          firstName={firstName}
          secondsLeft={phase.secondsLeft}
        />
        <KkNote tone="muted">{IN_PERSON_VALIDITY_NOTE}</KkNote>
      </>
    );
  }

  return <KkSkeletonBlock lines={SKELETON_LINES} />;
};

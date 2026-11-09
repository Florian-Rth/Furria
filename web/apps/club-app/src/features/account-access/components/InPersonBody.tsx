import { KkAlert } from '@furria/ui/KkAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import type { InPersonPhase } from '../in-person-phase';
import type { InPersonPurpose } from '../types';
import { InPersonCodeCard } from './InPersonCodeCard';
import { InPersonRedeemed } from './InPersonRedeemed';

const SKELETON_LINES = 6;
const EXPIRED_SECONDS = 0;

interface InPersonBodyProps {
  purpose: InPersonPurpose;
  phase: InPersonPhase;
  firstName: string;
  rejection: string | null;
}

export const InPersonBody: FC<InPersonBodyProps> = ({ purpose, phase, firstName, rejection }) => {
  if (phase.kind === 'redeemed') {
    return <InPersonRedeemed purpose={purpose} firstName={firstName} />;
  }
  if (phase.kind === 'failed') {
    return <KkAlert severity="error">{rejection}</KkAlert>;
  }
  if (phase.kind === 'expired') {
    return (
      <InPersonCodeCard
        purpose={purpose}
        invitation={phase.invitation}
        firstName={firstName}
        secondsLeft={EXPIRED_SECONDS}
      />
    );
  }
  if (phase.kind === 'showing') {
    return (
      <InPersonCodeCard
        purpose={purpose}
        invitation={phase.invitation}
        firstName={firstName}
        secondsLeft={phase.secondsLeft}
      />
    );
  }

  return <KkSkeletonBlock lines={SKELETON_LINES} />;
};

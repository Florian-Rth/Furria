import { KkChip, KkRadioGroup } from '@furria/ui';
import type { FC } from 'react';
import { toCandidateChoice } from '../admission';
import { THIS_IS_HER_CHIP, toCandidateDescription } from '../admission-labels';
import { toApplicantName } from '../manage-membership-applications-labels';
import type { AdmissionCandidate } from '../schemas';

interface AdmissionCandidateOptionProps {
  candidate: AdmissionCandidate;
  choice: string | null;
}

export const AdmissionCandidateOption: FC<AdmissionCandidateOptionProps> = ({
  candidate,
  choice,
}) => {
  const value = toCandidateChoice(candidate);
  const name = toApplicantName(candidate);
  const description = toCandidateDescription(candidate);
  const thisIsHer =
    choice === value ? (
      <KkChip tone={THIS_IS_HER_CHIP.tone} dot={THIS_IS_HER_CHIP.dot} size="small">
        {THIS_IS_HER_CHIP.label}
      </KkChip>
    ) : undefined;

  return (
    <KkRadioGroup.Option
      value={value}
      label={name}
      description={description}
      trailing={thisIsHer}
      disabled={candidate.isMember}
    />
  );
};

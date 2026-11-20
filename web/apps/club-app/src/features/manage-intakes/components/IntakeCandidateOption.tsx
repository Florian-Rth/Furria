import { KkChip } from '@furria/ui/KkChip';
import { KkRadioGroup } from '@furria/ui/KkRadioGroup';
import type { FC } from 'react';
import { THIS_IS_HER_CHIP, toCandidateDescription } from '../intake-labels';
import type { ReviewChoice } from '../intake-review';
import { toCandidateChoice } from '../intake-review';
import type { IntakeCandidate } from '../schemas';

interface IntakeCandidateOptionProps {
  candidate: IntakeCandidate;
  choice: ReviewChoice | null;
}

export const IntakeCandidateOption: FC<IntakeCandidateOptionProps> = ({ candidate, choice }) => {
  const value = toCandidateChoice(candidate);
  const name = `${candidate.firstName} ${candidate.lastName}`;
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
    />
  );
};

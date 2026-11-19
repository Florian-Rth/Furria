import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkRadioGroup } from '@furria/ui/KkRadioGroup';
import type { FC } from 'react';
import {
  CANDIDATE_CHOICE_LABEL,
  CANDIDATES_SECTION,
  NEW_PERSON_LABEL,
  toNewPersonDescription,
} from '../intake-labels';
import type { ReviewChoice } from '../intake-review';
import { NEW_PERSON_CHOICE } from '../intake-review';
import type { IntakeReview } from '../schemas';
import { IntakeCandidateOption } from './IntakeCandidateOption';

const CHOICE_NAME = 'intake-person';

interface IntakeCandidateChoiceProps {
  review: IntakeReview;
  choice: ReviewChoice | null;
  onChoose: (choice: string) => void;
}

export const IntakeCandidateChoice: FC<IntakeCandidateChoiceProps> = ({
  review,
  choice,
  onChoose,
}) => {
  const newPersonDescription = toNewPersonDescription(review.newcomer.firstName);
  const options = review.candidates.map((candidate) => (
    <IntakeCandidateOption key={candidate.personId} candidate={candidate} choice={choice} />
  ));

  return (
    <KkFormSection title={CANDIDATES_SECTION}>
      <KkRadioGroup
        name={CHOICE_NAME}
        label={CANDIDATE_CHOICE_LABEL}
        value={choice}
        onChange={onChoose}
      >
        {options}
        <KkRadioGroup.Option
          value={NEW_PERSON_CHOICE}
          label={NEW_PERSON_LABEL}
          description={newPersonDescription}
        />
      </KkRadioGroup>
    </KkFormSection>
  );
};

import { KkNote, KkPanelSection, KkRadioGroup } from '@furria/ui';
import type { FC } from 'react';
import { NEW_PERSON_CHOICE } from '../admission';
import {
  CANDIDATE_CHOICE_LABEL,
  CANDIDATES_LEAD,
  CANDIDATES_SECTION_TITLE,
  NEW_PERSON_LABEL,
  toNewPersonDescription,
  toNoCandidatesNote,
} from '../admission-labels';
import type { MembershipApplicationDetails } from '../schemas';
import { AdmissionCandidateOption } from './AdmissionCandidateOption';

const CHOICE_NAME = 'admission-person';

interface AdmissionCandidateChoiceProps {
  application: MembershipApplicationDetails;
  choice: string | null;
  onChoose: (choice: string) => void;
}

export const AdmissionCandidateChoice: FC<AdmissionCandidateChoiceProps> = ({
  application,
  choice,
  onChoose,
}) => {
  if (application.candidates.length === 0) {
    const noCandidates = toNoCandidatesNote(application.firstName);

    return <KkNote>{noCandidates}</KkNote>;
  }

  const newPersonDescription = toNewPersonDescription(application.firstName);
  const candidateOptions = application.candidates.map((candidate) => (
    <AdmissionCandidateOption key={candidate.personId} candidate={candidate} choice={choice} />
  ));

  return (
    <KkPanelSection title={CANDIDATES_SECTION_TITLE}>
      <KkNote tone="muted">{CANDIDATES_LEAD}</KkNote>
      <KkRadioGroup
        name={CHOICE_NAME}
        label={CANDIDATE_CHOICE_LABEL}
        value={choice}
        onChange={onChoose}
      >
        {candidateOptions}
        <KkRadioGroup.Option
          value={NEW_PERSON_CHOICE}
          label={NEW_PERSON_LABEL}
          description={newPersonDescription}
        />
      </KkRadioGroup>
    </KkPanelSection>
  );
};

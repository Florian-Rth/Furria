import type { FC } from 'react';
import { ClubMailButton } from '@/components/ClubMailButton';
import { applyMinorNote, applyTooYoungMailLabel } from '@/features/membership/apply-content';
import type { ApplicantStanding } from '@/features/membership/membership-derivation';
import { ApplyForm } from './ApplyForm/ApplyForm';

interface ApplyStandingNoteProps {
  standing: ApplicantStanding;
}

export const ApplyStandingNote: FC<ApplyStandingNoteProps> = ({ standing }) => {
  if (standing === 'minor') {
    return <ApplyForm.Note>{applyMinorNote}</ApplyForm.Note>;
  }

  if (standing === 'tooYoung') {
    return (
      <ClubMailButton variant="outlined" color="primary" fullWidth>
        {applyTooYoungMailLabel}
      </ClubMailButton>
    );
  }

  return null;
};

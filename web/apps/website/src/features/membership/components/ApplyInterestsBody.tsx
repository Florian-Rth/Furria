import type { FC } from 'react';
import { applyInterestsErrorNote } from '@/features/membership/apply-content';
import type { GroupsSource } from '@/features/membership/hooks/use-groups-source';
import { ApplyForm } from './ApplyForm/ApplyForm';

interface ApplyInterestsBodyProps {
  source: GroupsSource;
}

export const ApplyInterestsBody: FC<ApplyInterestsBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <ApplyForm.Status />;
  }

  if (source.status === 'error') {
    return <ApplyForm.Note>{applyInterestsErrorNote}</ApplyForm.Note>;
  }

  return <ApplyForm.Interests groups={source.groups} />;
};

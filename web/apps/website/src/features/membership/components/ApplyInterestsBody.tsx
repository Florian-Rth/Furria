import type { FC } from 'react';
import { applyInterestsErrorNote } from '@/features/membership/apply-content';
import { useGroupsSource } from '@/features/membership/hooks/use-groups-source';
import { ApplyForm } from './ApplyForm/ApplyForm';

export const ApplyInterestsBody: FC = () => {
  const source = useGroupsSource();

  if (source.status === 'loading') {
    return <ApplyForm.Status />;
  }

  if (source.status === 'error') {
    return <ApplyForm.Note>{applyInterestsErrorNote}</ApplyForm.Note>;
  }

  return <ApplyForm.Interests groups={source.groups} />;
};

import type { FC } from 'react';
import { applyInterestsLegend, applyInterestsNote } from '@/features/membership/apply-content';
import type { GroupsSource } from '@/features/membership/hooks/use-groups-source';
import { ApplyForm } from './ApplyForm/ApplyForm';
import { ApplyInterestsBody } from './ApplyInterestsBody';

interface ApplyInterestsFieldsetProps {
  source: GroupsSource;
}

export const ApplyInterestsFieldset: FC<ApplyInterestsFieldsetProps> = ({ source }) => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyInterestsLegend}</ApplyForm.Legend>
    <ApplyForm.Note>{applyInterestsNote}</ApplyForm.Note>
    <ApplyInterestsBody source={source} />
  </ApplyForm.Block>
);

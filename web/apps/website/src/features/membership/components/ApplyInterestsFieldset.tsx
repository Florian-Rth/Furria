import type { FC } from 'react';
import { applyInterestsLegend, applyInterestsNote } from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';
import { ApplyInterestsBody } from './ApplyInterestsBody';

export const ApplyInterestsFieldset: FC = () => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyInterestsLegend}</ApplyForm.Legend>
    <ApplyForm.Note>{applyInterestsNote}</ApplyForm.Note>
    <ApplyInterestsBody />
  </ApplyForm.Block>
);

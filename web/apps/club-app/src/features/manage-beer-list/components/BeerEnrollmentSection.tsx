import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerEnrollment } from '../schemas';
import { BeerEnrollmentRow } from './BeerEnrollmentRow';

interface BeerEnrollmentSectionProps {
  label: string;
  enrollments: readonly BeerEnrollment[];
}

export const BeerEnrollmentSection: FC<BeerEnrollmentSectionProps> = ({ label, enrollments }) => {
  const facts = String(enrollments.length);
  const rows = enrollments.map((enrollment) => (
    <BeerEnrollmentRow key={enrollment.enrollmentId} enrollment={enrollment} />
  ));

  return (
    <Stack>
      <KkPourDay label={label} facts={facts} />
      {rows}
    </Stack>
  );
};

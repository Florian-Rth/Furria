import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { applyFieldLabels, applyPersonLegend } from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';

interface ApplyPersonFieldsetProps {
  today: Date;
}

export const ApplyPersonFieldset: FC<ApplyPersonFieldsetProps> = ({ today }) => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyPersonLegend}</ApplyForm.Legend>
    <ApplyForm.BlockBody>
      <ApplyForm.Fields>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ApplyForm.Field
            name="firstName"
            label={applyFieldLabels.firstName}
            required
            autoComplete="given-name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ApplyForm.Field
            name="lastName"
            label={applyFieldLabels.lastName}
            required
            autoComplete="family-name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ApplyForm.BirthDate today={today} />
        </Grid>
      </ApplyForm.Fields>
    </ApplyForm.BlockBody>
  </ApplyForm.Block>
);

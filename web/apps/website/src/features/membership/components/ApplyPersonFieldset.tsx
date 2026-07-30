import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { applyFieldLabels, applyPersonLegend } from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';

export const ApplyPersonFieldset: FC = () => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyPersonLegend}</ApplyForm.Legend>
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
        <ApplyForm.Field
          name="birthDate"
          label={applyFieldLabels.birthDate}
          type="date"
          required
          autoComplete="bday"
        />
      </Grid>
    </ApplyForm.Fields>
  </ApplyForm.Block>
);

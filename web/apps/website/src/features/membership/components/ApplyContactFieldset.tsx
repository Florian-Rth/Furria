import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import {
  applyContactLegend,
  applyContactNote,
  applyFieldLabels,
} from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';

export const ApplyContactFieldset: FC = () => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyContactLegend}</ApplyForm.Legend>
    <ApplyForm.BlockBody>
      <ApplyForm.Fields>
        <Grid size={{ xs: 12, sm: 7 }}>
          <ApplyForm.Field
            name="email"
            label={applyFieldLabels.email}
            type="email"
            required
            autoComplete="email"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <ApplyForm.Field
            name="phone"
            label={applyFieldLabels.phone}
            type="tel"
            required={false}
            autoComplete="tel"
          />
        </Grid>
      </ApplyForm.Fields>
      <ApplyForm.Note>{applyContactNote}</ApplyForm.Note>
    </ApplyForm.BlockBody>
  </ApplyForm.Block>
);

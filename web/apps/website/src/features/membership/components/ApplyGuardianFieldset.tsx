import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import {
  applyFieldLabels,
  applyGuardianLegend,
  applyGuardianNote,
} from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';

export const ApplyGuardianFieldset: FC = () => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyGuardianLegend}</ApplyForm.Legend>
    <ApplyForm.BlockBody>
      <ApplyForm.Note>{applyGuardianNote}</ApplyForm.Note>
      <ApplyForm.Fields>
        <Grid size={12}>
          <ApplyForm.Field name="guardianName" label={applyFieldLabels.guardianName} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ApplyForm.Field
            name="guardianEmail"
            label={applyFieldLabels.guardianEmail}
            type="email"
            required={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ApplyForm.Field
            name="guardianPhone"
            label={applyFieldLabels.guardianPhone}
            type="tel"
            required={false}
          />
        </Grid>
      </ApplyForm.Fields>
    </ApplyForm.BlockBody>
  </ApplyForm.Block>
);

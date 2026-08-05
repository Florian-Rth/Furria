import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import {
  applyAddressLegend,
  applyAddressNote,
  applyFieldLabels,
} from '@/features/membership/apply-content';
import { ApplyForm } from './ApplyForm/ApplyForm';

export const ApplyAddressFieldset: FC = () => (
  <ApplyForm.Block>
    <ApplyForm.Legend>{applyAddressLegend}</ApplyForm.Legend>
    <ApplyForm.BlockBody>
      <ApplyForm.Fields>
        <Grid size={12}>
          <ApplyForm.Field
            name="street"
            label={applyFieldLabels.street}
            required
            autoComplete="street-address"
          />
        </Grid>
        <Grid size={{ xs: 5, sm: 4 }}>
          <ApplyForm.Field
            name="postalCode"
            label={applyFieldLabels.postalCode}
            required
            autoComplete="postal-code"
          />
        </Grid>
        <Grid size={{ xs: 7, sm: 8 }}>
          <ApplyForm.Field
            name="city"
            label={applyFieldLabels.city}
            required
            autoComplete="address-level2"
          />
        </Grid>
      </ApplyForm.Fields>
      <ApplyForm.Note>{applyAddressNote}</ApplyForm.Note>
    </ApplyForm.BlockBody>
  </ApplyForm.Block>
);

import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { FEE_REDUCTION_BASIS_OPTIONS } from '../manage-persons-labels';

const FIELD_NAME = 'help-fee-reduction-basis';
const BASIS_LABEL = 'Grundlage';
const SAMPLE_BASIS = 'school';

const keep = (): void => {};

export const FeeReductionHelpBasisPreview: FC = () => (
  <KkSelectField
    name={FIELD_NAME}
    label={BASIS_LABEL}
    value={SAMPLE_BASIS}
    options={FEE_REDUCTION_BASIS_OPTIONS}
    onChange={keep}
    presentation="choices"
  />
);

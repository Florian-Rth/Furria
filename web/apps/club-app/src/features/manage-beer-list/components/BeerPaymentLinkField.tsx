import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { LINK_LABEL } from '../beer-hub-copy';
import type { PotFields } from '../hooks/use-pot-fields';

interface BeerPaymentLinkFieldProps {
  fields: PotFields;
}

export const BeerPaymentLinkField: FC<BeerPaymentLinkFieldProps> = ({ fields }) => (
  <KkTextField
    name="paymentLink"
    label={LINK_LABEL}
    type="url"
    value={fields.link}
    onChange={fields.changeLink}
    onBlur={fields.touchLink}
  />
);

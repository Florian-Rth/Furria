import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import {
  DETAILS_MISSING,
  LINK_LABEL,
  NOTE_LABEL,
  PRICE_HINT,
  PRICE_INVALID,
  PRICE_LABEL,
} from '../beer-hub-copy';
import type { PotSettingsForm } from '../hooks/use-pot-settings-form';

interface BeerPotSettingsFieldsProps {
  form: PotSettingsForm;
}

export const BeerPotSettingsFields: FC<BeerPotSettingsFieldsProps> = ({ form }) => {
  const priceHelper = form.priceInvalid ? PRICE_INVALID : PRICE_HINT;
  const noteHelper = form.detailsMissing ? DETAILS_MISSING : undefined;
  const changeLink = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    form.setLink(event.target.value);
  };
  const changeNote = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    form.setNote(event.target.value);
  };

  return (
    <>
      <KkPriceField
        name="price"
        label={PRICE_LABEL}
        value={form.priceText}
        onChange={form.setPriceText}
        error={form.priceInvalid}
        helperText={priceHelper}
      />
      <KkTextField
        name="paymentLink"
        label={LINK_LABEL}
        type="url"
        value={form.link}
        onChange={changeLink}
      />
      <KkTextField
        name="paymentNote"
        label={NOTE_LABEL}
        value={form.note}
        onChange={changeNote}
        error={form.detailsMissing}
        helperText={noteHelper}
      />
    </>
  );
};

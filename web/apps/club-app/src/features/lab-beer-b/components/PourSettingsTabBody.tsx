import { KkButton } from '@furria/ui/KkButton';
import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { PourHub } from '../hooks/use-pour-hub';
import { usePourSettingsForm } from '../hooks/use-pour-settings-form';
import {
  LINK_LABEL,
  NOTE_LABEL,
  PRICE_HINT,
  PRICE_INVALID,
  PRICE_LABEL,
  SAVE_LABEL,
} from '../pour-hub-copy';

interface PourSettingsTabBodyProps {
  hub: PourHub;
}

export const PourSettingsTabBody: FC<PourSettingsTabBodyProps> = ({ hub }) => {
  const form = usePourSettingsForm(hub.world.pot);
  const invalid = form.settings === null;
  const priceHelper = invalid ? PRICE_INVALID : PRICE_HINT;
  const changeLink = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    form.setLink(event.target.value);
  };
  const changeNote = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    form.setNote(event.target.value);
  };
  const save = (): void => {
    if (form.settings !== null && hub.saveSettings(form.settings)) {
      hub.closeSide();
    }
  };

  return (
    <>
      <KkPriceField
        name="price"
        label={PRICE_LABEL}
        value={form.priceText}
        onChange={form.setPriceText}
        error={invalid}
        helperText={priceHelper}
      />
      <KkTextField
        name="paymentLink"
        label={LINK_LABEL}
        type="url"
        value={form.link}
        onChange={changeLink}
      />
      <KkTextField name="paymentNote" label={NOTE_LABEL} value={form.note} onChange={changeNote} />
      <KkButton variant="contained" size="large" disabled={invalid} onClick={save}>
        {SAVE_LABEL}
      </KkButton>
    </>
  );
};

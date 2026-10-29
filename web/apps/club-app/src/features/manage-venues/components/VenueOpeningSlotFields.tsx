import { KkButton } from '@furria/ui/KkButton';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { OpeningSlotControl } from '../hooks/use-venue-editor';
import { OPENING_WEEKDAY_OPTIONS } from '../manage-venues-labels';

const WEEKDAY_LABEL = 'Tag';
const OPENS_LABEL = 'Von';
const CLOSES_LABEL = 'Bis';
const REMOVE_LABEL = 'Entfernen';

interface VenueOpeningSlotFieldsProps {
  control: OpeningSlotControl;
  index: number;
}

export const VenueOpeningSlotFields: FC<VenueOpeningSlotFieldsProps> = ({ control, index }) => {
  const { slot } = control;
  const name = `openingHours.${index}`;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkFormPair
        start={
          <KkSelectField
            name={`${name}.weekday`}
            label={WEEKDAY_LABEL}
            value={slot.weekday}
            options={OPENING_WEEKDAY_OPTIONS}
            onChange={control.setWeekday}
            presentation="select"
            required
            error={control.weekdayError !== undefined}
            helperText={control.weekdayError}
          />
        }
        end={
          <KkFormPair
            phone="side"
            start={
              <KkTimeField
                name={`${name}.opens`}
                label={OPENS_LABEL}
                value={slot.opens}
                onChange={control.setOpens}
                required
                error={control.opensError !== undefined}
                helperText={control.opensError}
              />
            }
            end={
              <KkTimeField
                name={`${name}.closes`}
                label={CLOSES_LABEL}
                value={slot.closes}
                onChange={control.setCloses}
                required
                error={control.closesError !== undefined}
                helperText={control.closesError}
              />
            }
          />
        }
      />
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <KkButton variant="text" size="small" onClick={control.remove}>
          {REMOVE_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};

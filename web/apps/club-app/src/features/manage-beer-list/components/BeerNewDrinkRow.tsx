import { KkChip } from '@furria/ui/KkChip';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DRINK_NAME_MAX } from '../beer-hub';
import { DEFAULT_MARK, DRINK_NAME_LABEL, PRICE_LABEL, REMOVE_DRINK_LABEL } from '../beer-hub-copy';
import type { DrinkRowField } from '../hooks/use-drink-rows';

const NAME_SX = { flex: 3, minWidth: 0 } as const;
const REMOVE_SX = { mt: 1.5 } as const;
const MARK_SX = { mt: 2, flexShrink: 0 } as const;

interface BeerNewDrinkRowProps {
  row: DrinkRowField;
}

export const BeerNewDrinkRow: FC<BeerNewDrinkRowProps> = ({ row }) => {
  const nameInvalid = row.nameError !== undefined;
  const priceInvalid = row.priceError !== undefined;
  const remove = row.canRemove ? (
    <KkIconButton
      label={REMOVE_DRINK_LABEL}
      icon="close"
      size="small"
      onClick={row.remove}
      sx={REMOVE_SX}
    />
  ) : null;
  const mark = row.isDefault ? (
    <KkChip tone="blue" size="small" sx={MARK_SX}>
      {DEFAULT_MARK}
    </KkChip>
  ) : null;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start', minWidth: 0 }}>
        <KkTextField
          name={`drink-name-${row.key}`}
          label={DRINK_NAME_LABEL}
          value={row.name}
          maxLength={DRINK_NAME_MAX}
          onChange={row.changeName}
          error={nameInvalid}
          helperText={row.nameError}
          sx={NAME_SX}
        />
        {mark}
        {remove}
      </Stack>
      <KkPriceField
        name={`drink-price-${row.key}`}
        label={PRICE_LABEL}
        value={row.priceText}
        onChange={row.setPriceText}
        error={priceInvalid}
        helperText={row.priceError}
      />
    </Stack>
  );
};

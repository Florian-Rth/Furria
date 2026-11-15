import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ADD_DRINK_ROW_LABEL } from '../beer-hub-copy';
import type { DrinkRows } from '../hooks/use-drink-rows';
import { BeerNewDrinkRow } from './BeerNewDrinkRow';

const ADD_ICON = <KkIcon name="add" size="small" />;
const ADD_SX = { alignSelf: 'flex-start' } as const;

interface BeerNewDrinkRowsProps {
  drinks: DrinkRows;
}

export const BeerNewDrinkRows: FC<BeerNewDrinkRowsProps> = ({ drinks }) => {
  const rows = drinks.rows.map((row) => <BeerNewDrinkRow key={row.key} row={row} />);

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {rows}
      <KkButton
        variant="text"
        startIcon={ADD_ICON}
        disabled={!drinks.canAdd}
        onClick={drinks.add}
        sx={ADD_SX}
      >
        {ADD_DRINK_ROW_LABEL}
      </KkButton>
    </Stack>
  );
};

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerListPage } from '../hooks/use-beer-list-page';
import { BeerListAction } from './BeerListAction';
import { BeerListGivers } from './BeerListGivers';
import { BeerListHead } from './BeerListHead';
import { BeerListHistory } from './BeerListHistory';
import { BeerPayRow } from './BeerPayRow';

const SIDE_SIZE = { xs: 12, md: 5 } as const;
const MAIN_SIZE = { xs: 12, md: 7 } as const;

interface BeerListBodyProps {
  page: BeerListPage;
}

export const BeerListBody: FC<BeerListBodyProps> = ({ page }) => {
  const { booking } = page;
  const payRows = page.payees.map((payee) => <BeerPayRow key={payee.potId} payee={payee} />);
  const history =
    page.history.length === 0 ? null : (
      <BeerListHistory
        groups={page.history}
        myPersonId={page.myPersonId}
        now={page.now}
        freshIds={booking.freshCrateIds}
      />
    );
  const givers =
    page.givers === null ? null : (
      <BeerListGivers givers={page.givers} myPersonId={page.myPersonId} />
    );

  return (
    <Grid container columnSpacing={4} rowSpacing={3} sx={{ minWidth: 0 }}>
      <Grid size={SIDE_SIZE} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <BeerListHead
            totals={page.totals}
            strokes={page.strokes}
            celebration={booking.celebration}
            now={page.now}
          />
          {payRows}
          <BeerListAction gate={page.gate} booking={booking} />
        </Stack>
      </Grid>
      <Grid size={MAIN_SIZE} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3, minWidth: 0 }}>
          {history}
          {givers}
        </Stack>
      </Grid>
    </Grid>
  );
};

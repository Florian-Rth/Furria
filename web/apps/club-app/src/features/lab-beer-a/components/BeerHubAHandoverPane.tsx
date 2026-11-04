import { KkFactLine } from '@furria/ui/KkFactLine';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabBeerPerson } from '@/features/lab-beer/beer-lab-types';
import { cratesLabel, HANDOVER_NOTE, OWNER_LABEL, STOCK_NOW } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';

interface BeerHubAHandoverPaneProps {
  owner: LabBeerPerson | null;
  stock: number;
}

export const BeerHubAHandoverPane: FC<BeerHubAHandoverPaneProps> = ({ owner, stock }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkFactLine label={OWNER_LABEL} value={nameOf(owner)} />
    <KkFactLine label={STOCK_NOW} value={cratesLabel(stock)} />
    <KkNote icon="info">{HANDOVER_NOTE}</KkNote>
  </Stack>
);

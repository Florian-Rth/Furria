import { KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toArchivedSinceLabel, VACANT_NOTE } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';
import { OfficeFlags } from './OfficeFlags';

interface OfficeHeadFactsProps {
  office: BoardOffice;
  isVacant: boolean;
}

export const OfficeHeadFacts: FC<OfficeHeadFactsProps> = ({ office, isVacant }) => {
  if (office.archivedOn !== null) {
    return <KkMeta>{toArchivedSinceLabel(office.archivedOn)}</KkMeta>;
  }

  const vacant = isVacant ? <KkMeta>{VACANT_NOTE}</KkMeta> : null;

  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
      {vacant}
      <OfficeFlags office={office} />
    </Stack>
  );
};

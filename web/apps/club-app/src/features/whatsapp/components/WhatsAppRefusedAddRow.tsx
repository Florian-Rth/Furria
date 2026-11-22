import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toRefusedAddRow } from '../refused-add-row';
import type { WhatsAppRefusedAdd } from '../schemas';

const PERSON_ROUTE = '/manage/persons/$personId';

interface WhatsAppRefusedAddRowProps {
  add: WhatsAppRefusedAdd;
}

export const WhatsAppRefusedAddRow: FC<WhatsAppRefusedAddRowProps> = ({ add }) => {
  const row = toRefusedAddRow(add);

  return (
    <KkPersonRow
      initials={row.initials}
      name={row.name}
      meta={row.meta}
      to={PERSON_ROUTE}
      params={row.params}
    />
  );
};

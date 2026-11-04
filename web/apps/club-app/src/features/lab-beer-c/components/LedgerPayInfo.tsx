import { KkLedgerPayBlock } from '@furria/ui/KkLedgerPayBlock';
import type { FC } from 'react';
import type { LabBeerPerson, LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import type { CopyText } from '../hooks/use-copy-text';
import { COPY_LABEL, PAY_LINK_LABEL, PAY_TITLE, payOwnerText } from '../ledger-copy';

interface LedgerPayInfoProps {
  pot: LabBeerPot;
  owner: LabBeerPerson | null;
  copy: CopyText;
}

export const LedgerPayInfo: FC<LedgerPayInfoProps> = ({ pot, owner, copy }) => {
  const ownerName = owner === null ? '' : `${owner.firstName} ${owner.lastName}`;
  const ownerLine = payOwnerText(ownerName);

  return (
    <KkLedgerPayBlock
      title={PAY_TITLE}
      owner={ownerLine}
      linkLabel={PAY_LINK_LABEL}
      href={pot.paymentLink}
      note={pot.paymentNote}
      copyLabel={COPY_LABEL}
      copied={copy.copied}
      onCopy={copy.copy}
    />
  );
};

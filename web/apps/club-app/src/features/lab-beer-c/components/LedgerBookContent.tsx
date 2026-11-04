import { KkText } from '@furria/ui/KkText';
import type { FC, ReactNode } from 'react';
import type { LedgerBooking } from '../hooks/use-ledger-booking';
import { EMPTY_STOCK } from '../ledger-copy';
import { LedgerBookDone } from './LedgerBookDone';
import { LedgerBookForm } from './LedgerBookForm';
import { LedgerDeclaration } from './LedgerDeclaration';

interface LedgerBookContentProps {
  booking: LedgerBooking;
  fireKey: number;
  ownerName: string;
  payment: ReactNode;
}

export const LedgerBookContent: FC<LedgerBookContentProps> = ({
  booking,
  fireKey,
  ownerName,
  payment,
}) => {
  if (booking.done !== null) {
    const canAgain = booking.stance === 'book';

    return (
      <LedgerBookDone
        done={booking.done}
        price={booking.price}
        canAgain={canAgain}
        payment={payment}
        onAgain={booking.again}
      />
    );
  }

  switch (booking.stance) {
    case 'book':
      return <LedgerBookForm booking={booking} fireKey={fireKey} />;
    case 'empty':
      return <KkText variant="subtitle1">{EMPTY_STOCK}</KkText>;
    default:
      return <LedgerDeclaration owner={ownerName} onJoin={booking.join} />;
  }
};

import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkLedgerPage } from '@furria/ui/KkLedgerPage';
import { KkLedgerPayBlock } from '@furria/ui/KkLedgerPayBlock';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useLedgerBookPage } from '../hooks/use-ledger-book-page';
import {
  BOOK_EYEBROW,
  bookOwnerText,
  COPY_LABEL,
  PAY_LINK_LABEL,
  PAY_TITLE,
  payOwnerText,
} from '../ledger-copy';
import type { LedgerViewer } from '../schemas';
import { LabViewerSwitch } from './LabViewerSwitch';
import { LedgerBookContent } from './LedgerBookContent';

const BOOK_PATH = '/lab-beer-book-c';
const BOOK_VIEWERS: readonly LedgerViewer[] = [
  'openTab',
  'bigDebt',
  'fresh',
  'notEnrolled',
  'former',
];

interface LedgerBookPageProps {
  viewer: LedgerViewer;
}

export const LedgerBookPage: FC<LedgerBookPageProps> = ({ viewer }) => {
  const page = useLedgerBookPage(viewer);
  const { booking } = page;
  const ownerName = page.owner === null ? '' : `${page.owner.firstName} ${page.owner.lastName}`;
  const personName = page.person === null ? '' : `${page.person.firstName} ${page.person.lastName}`;
  const ownerLine = bookOwnerText(ownerName);
  const payOwner = payOwnerText(ownerName);
  const payment = (
    <KkLedgerPayBlock
      title={PAY_TITLE}
      owner={payOwner}
      linkLabel={PAY_LINK_LABEL}
      href={page.paymentLink}
      note={page.paymentNote}
      copyLabel={COPY_LABEL}
      copied={page.copy.copied}
      onCopy={page.copy.copy}
    />
  );
  const labSwitch = (
    <LabViewerSwitch
      path={BOOK_PATH}
      viewer={viewer}
      viewers={BOOK_VIEWERS}
      onEmptyStock={page.emptyStock}
    />
  );

  return (
    <KkLedgerPage label={BOOK_EYEBROW} after={labSwitch}>
      <Stack sx={{ gap: 0.25 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}
        >
          <KkEyebrow>{BOOK_EYEBROW}</KkEyebrow>
          <KkText variant="caption" tone="secondary">
            {personName}
          </KkText>
        </Stack>
        <KkText variant="body2" tone="secondary">
          {ownerLine}
        </KkText>
      </Stack>
      <LedgerBookContent
        booking={booking}
        fireKey={page.fireKey}
        ownerName={ownerName}
        payment={payment}
      />
    </KkLedgerPage>
  );
};

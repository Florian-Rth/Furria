import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkPourPage } from '@furria/ui/KkPourPage';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { usePourBooking } from '../hooks/use-pour-booking';
import { BOOK_EYEBROW, BOOK_PAGE_LABEL, whoLineOf } from '../pour-booking-copy';
import { fullNameOf } from '../pour-copy';
import type { PourLabOption, PourViewer } from '../schemas';
import { POUR_VIEWERS } from '../schemas';
import { PourBookingBody } from './PourBookingBody';
import { PourBookingThumb } from './PourBookingThumb';
import { PourViewerSwitch } from './PourViewerSwitch';

const EMPTY_OPTION_ID = 'empty';
const LAB_EXTRA: readonly PourLabOption[] = [{ id: EMPTY_OPTION_ID, label: 'Bestand leer' }];

interface PourBookingPageProps {
  viewer: PourViewer;
  empty: boolean;
  onLab: (id: string) => void;
}

export const PourBookingPage: FC<PourBookingPageProps> = ({ viewer, empty, onLab }) => {
  const booking = usePourBooking(viewer, empty);
  const owner = fullNameOf(labBeerPersonOf(booking.world.pot.ownerId));
  const name = labBeerPersonOf(booking.viewerId)?.firstName ?? '';
  const who = whoLineOf(name, booking.member);
  const labValue = empty ? EMPTY_OPTION_ID : viewer;

  return (
    <KkPourPage label={BOOK_PAGE_LABEL}>
      <KkPourPage.Head>
        <KkEyebrow tone="accent">{BOOK_EYEBROW}</KkEyebrow>
        <KkText variant="body2" tone="secondary">
          {who}
        </KkText>
      </KkPourPage.Head>
      <KkPourPage.Body>
        <PourBookingBody booking={booking} owner={owner} />
      </KkPourPage.Body>
      <KkPourPage.Thumb>
        <PourBookingThumb booking={booking} owner={owner} />
      </KkPourPage.Thumb>
      <PourViewerSwitch
        viewers={POUR_VIEWERS}
        value={labValue}
        extra={LAB_EXTRA}
        onChange={onLab}
        sx={{ py: 3 }}
      />
    </KkPourPage>
  );
};

import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import {
  FAILED_TITLE,
  NO_POT_TEXT,
  NO_POT_TITLE,
  UNAFFILIATED_TEXT,
  UNAFFILIATED_TITLE,
} from '../beer-book-copy';
import { RETRY_LABEL } from '../beer-list-copy';
import { useBeerBookPage } from '../hooks/use-beer-book-page';
import { BeerBookBooking } from './BeerBookBooking';
import { BeerBookDeclaration } from './BeerBookDeclaration';
import { BeerBookHead } from './BeerBookHead';
import { BeerBookStatus } from './BeerBookStatus';

export const BeerBookTab: FC = () => {
  const page = useBeerBookPage();
  const head = <BeerBookHead caption={page.caption} title={page.title} />;

  switch (page.stage) {
    case 'book':
      return (
        <BeerBookBooking head={head} tally={page.tally} booking={page.booking} done={page.done} />
      );
    case 'enroll':
      return (
        <BeerBookStatus head={head}>
          <BeerBookDeclaration joining={page.joining} />
        </BeerBookStatus>
      );
    case 'noPot':
      return (
        <BeerBookStatus head={head}>
          <KkEmptyState title={NO_POT_TITLE} description={NO_POT_TEXT} />
        </BeerBookStatus>
      );
    case 'unaffiliated':
      return (
        <BeerBookStatus head={head}>
          <KkEmptyState title={UNAFFILIATED_TITLE} description={UNAFFILIATED_TEXT} />
        </BeerBookStatus>
      );
    case 'failed': {
      const retry = (
        <KkButton loading={page.load.retrying} onClick={page.load.retry}>
          {RETRY_LABEL}
        </KkButton>
      );

      return (
        <BeerBookStatus head={head}>
          <KkErrorState title={FAILED_TITLE} description={page.load.failure} action={retry} />
        </BeerBookStatus>
      );
    }
    default:
      return (
        <BeerBookStatus head={head}>
          <KkSkeletonRow count={3} />
        </BeerBookStatus>
      );
  }
};

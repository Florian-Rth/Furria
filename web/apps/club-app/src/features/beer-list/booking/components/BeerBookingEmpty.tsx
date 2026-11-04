import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { EMPTY_STOCK_NOTE } from '../booking-copy';

export const BeerBookingEmpty: FC = () => <KkNote icon="info">{EMPTY_STOCK_NOTE}</KkNote>;

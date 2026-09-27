import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN } from '../app-sections';
import { NotAffiliatedState } from './NotAffiliatedState';

const SCREEN_TITLE = 'Nicht im Verein aktiv';

export const NotAffiliatedScreen: FC = () => (
  <KkScreen kind="list" title={SCREEN_TITLE} origin={CLUB_ORIGIN}>
    <NotAffiliatedState />
  </KkScreen>
);

import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import type { ScreenFrame } from '../screen-frame';
import { NotAffiliatedState } from './NotAffiliatedState';

const SCREEN_TITLE = 'Nicht im Verein aktiv';

export const NotAffiliatedScreen: FC<ScreenFrame> = ({ section, origin }) => {
  const state = <NotAffiliatedState />;

  if (section === undefined) {
    return (
      <KkScreen kind="list" title={SCREEN_TITLE} origin={origin}>
        {state}
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="list" title={SCREEN_TITLE} section={section}>
      {state}
    </KkScreen>
  );
};

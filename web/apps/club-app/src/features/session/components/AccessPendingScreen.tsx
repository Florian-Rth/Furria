import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { ACCESS_PENDING_LABEL } from '../session-messages';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AppListSkeleton } from './AppListSkeleton';

export const AccessPendingScreen: FC<AccessDeniedFrame> = ({ title, section, origin }) => {
  const skeleton = <AppListSkeleton label={ACCESS_PENDING_LABEL} listShape="rows" />;

  if (section === undefined) {
    return (
      <KkScreen kind="list" title={title} origin={origin}>
        {skeleton}
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="list" title={title} section={section}>
      {skeleton}
    </KkScreen>
  );
};

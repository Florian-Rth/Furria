import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import type { ScreenFrame } from '../screen-frame';
import { AccessDenied } from './AccessDenied';

export type AccessDeniedFrame = ScreenFrame & { title: string };

type AccessDeniedScreenProps = AccessDeniedFrame & { message: string };

export const AccessDeniedScreen: FC<AccessDeniedScreenProps> = ({
  title,
  message,
  section,
  origin,
}) => {
  const denial = <AccessDenied message={message} />;

  if (section === undefined) {
    return (
      <KkScreen kind="list" title={title} origin={origin}>
        {denial}
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="list" title={title} section={section}>
      {denial}
    </KkScreen>
  );
};

import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from './AccessDenied';

interface AccessDeniedRootFrame {
  title: string;
  section: string;
  origin?: never;
}

interface AccessDeniedNestedFrame {
  title: string;
  origin: KkScreenOrigin;
  section?: never;
}

export type AccessDeniedFrame = AccessDeniedRootFrame | AccessDeniedNestedFrame;

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

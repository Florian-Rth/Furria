import type { FC, PropsWithChildren } from 'react';
import { KkPanelStack } from '../../../KkPanelStack';
import { KkScreen } from '../../../KkShell/KkScreen';
import type { KkScreenActionBar, KkScreenOrigin } from '../../../KkShell/screen-declaration';

export interface KkWriteScreenRootProps extends PropsWithChildren {
  origin: KkScreenOrigin;
  title: string;
  action: KkScreenActionBar;
}

export const KkWriteScreenRoot: FC<KkWriteScreenRootProps> = ({
  origin,
  title,
  action,
  children,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={origin} action={action}>
    <KkPanelStack>{children}</KkPanelStack>
  </KkScreen>
);

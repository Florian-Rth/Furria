import type { FC, PropsWithChildren } from 'react';
import { KkPanelStack } from '../../../KkPanelStack';
import { KkScreen } from '../../../KkShell/KkScreen';
import type {
  KkScreenActionBar,
  KkScreenHelp,
  KkScreenOrigin,
} from '../../../KkShell/screen-declaration';

export interface KkWriteScreenRootProps extends PropsWithChildren {
  origin: KkScreenOrigin;
  title: string;
  action: KkScreenActionBar;
  help?: KkScreenHelp;
}

export const KkWriteScreenRoot: FC<KkWriteScreenRootProps> = ({
  origin,
  title,
  action,
  help,
  children,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={origin} action={action} help={help}>
    <KkPanelStack>{children}</KkPanelStack>
  </KkScreen>
);

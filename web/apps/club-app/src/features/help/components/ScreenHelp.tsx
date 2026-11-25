import { KkHelp } from '@furria/ui/KkHelp';
import type { FC, PropsWithChildren } from 'react';

const HELP_TITLE = 'Was du hier tun kannst';
const HELP_CLOSE_LABEL = 'Hilfe schließen';

export const ScreenHelp: FC<PropsWithChildren> = ({ children }) => (
  <KkHelp title={HELP_TITLE} closeLabel={HELP_CLOSE_LABEL}>
    {children}
  </KkHelp>
);

import { KkSection } from '@furria/ui/KkSection';
import type { FC, PropsWithChildren } from 'react';

export const ConfirmScreenRoot: FC<PropsWithChildren> = ({ children }) => (
  <KkSection>{children}</KkSection>
);

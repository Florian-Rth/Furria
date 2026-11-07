import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC, PropsWithChildren } from 'react';
import { EJ_CLOSE } from '../edit-jobs-copy';

interface EjPhoneDrawerProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export const EjPhoneDrawer: FC<EjPhoneDrawerProps> = ({ open, title, onClose, children }) => (
  <KkPracticeSteps open={open} label={title} onClose={onClose}>
    <KkPracticeSteps.Head>
      <KkPracticeSteps.Title text={title} />
      <KkPracticeSteps.Close label={EJ_CLOSE} onClose={onClose} />
    </KkPracticeSteps.Head>
    <KkPracticeSteps.List>{children}</KkPracticeSteps.List>
  </KkPracticeSteps>
);

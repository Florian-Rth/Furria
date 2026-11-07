import { JOB_CLOSE } from '@furria/studio/job-copy';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC, PropsWithChildren } from 'react';

interface JobPhoneDrawerProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export const JobPhoneDrawer: FC<JobPhoneDrawerProps> = ({ open, title, onClose, children }) => (
  <KkPracticeSteps open={open} label={title} onClose={onClose}>
    <KkPracticeSteps.Head>
      <KkPracticeSteps.Title text={title} />
      <KkPracticeSteps.Close label={JOB_CLOSE} onClose={onClose} />
    </KkPracticeSteps.Head>
    <KkPracticeSteps.List>{children}</KkPracticeSteps.List>
  </KkPracticeSteps>
);

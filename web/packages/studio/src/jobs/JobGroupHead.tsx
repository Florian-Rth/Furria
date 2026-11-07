import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC } from 'react';

interface JobGroupHeadProps {
  title: string | null;
  aside: string | null;
}

export const JobGroupHead: FC<JobGroupHeadProps> = ({ title, aside }) => {
  if (title === null) {
    return null;
  }

  return <KkJobPanel.GroupHead text={title} aside={aside} />;
};

import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface EjGroupHeadProps {
  title: string | null;
  aside: string | null;
}

export const EjGroupHead: FC<EjGroupHeadProps> = ({ title, aside }) => {
  if (title === null) {
    return null;
  }

  return <KkEjPanel.GroupHead text={title} aside={aside} />;
};

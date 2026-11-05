import { KkFormSection } from '@furria/ui/KkFormSection';
import type { FC, ReactNode } from 'react';
import type { HallElement } from '@/features/hall-plan/schemas';
import { ELEMENT_KIND_LABELS } from '../hall-builder-copy';
import { HallAreaFields } from './HallAreaFields';
import { HallDoorFields } from './HallDoorFields';
import { HallLineFields } from './HallLineFields';
import { HallPillarFields } from './HallPillarFields';
import { HallTextFields } from './HallTextFields';
import { HallWallFields } from './HallWallFields';

interface HallElementSectionProps {
  element: HallElement;
}

const fieldsOf = (element: HallElement): ReactNode => {
  switch (element.kind) {
    case 'wall':
      return <HallWallFields wall={element} />;
    case 'door':
      return <HallDoorFields door={element} />;
    case 'area':
      return <HallAreaFields area={element} />;
    case 'pillar':
      return <HallPillarFields pillar={element} />;
    case 'line':
      return <HallLineFields line={element} />;
    case 'text':
      return <HallTextFields text={element} />;
  }
};

export const HallElementSection: FC<HallElementSectionProps> = ({ element }) => {
  const fields = fieldsOf(element);

  return <KkFormSection title={ELEMENT_KIND_LABELS[element.kind]}>{fields}</KkFormSection>;
};

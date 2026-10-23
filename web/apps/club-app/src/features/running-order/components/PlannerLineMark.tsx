import { toImageSource } from '@furria/ui/image-source';
import type { KkIconName } from '@furria/ui/KkIcon';
import { KkPictureMark } from '@furria/ui/KkPictureMark';
import type { FC } from 'react';
import type { ActKind, ActRef } from '@/features/running-order/schemas';

const KIND_GLYPHS: Record<ActKind, KkIconName> = {
  dance: 'stage',
  speech: 'campaign',
  music: 'music',
  show: 'sparkle',
  point: 'flag',
};

interface PlannerLineMarkProps {
  act: ActRef;
}

export const PlannerLineMark: FC<PlannerLineMarkProps> = ({ act }) => {
  const group = act.group;
  const image = toImageSource(group?.picture ?? null, 'groupPicture');
  const icon = KIND_GLYPHS[act.kind ?? 'point'];

  return (
    <KkPictureMark
      image={image}
      tone={group?.tone ?? null}
      clubIcon={group?.icon ?? null}
      icon={icon}
      alt={group?.name ?? act.name}
    />
  );
};

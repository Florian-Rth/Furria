import { toImageSource } from '@furria/ui/image-source';
import { KkPictureMark } from '@furria/ui/KkPictureMark';
import { KkSpotlightList } from '@furria/ui/KkSpotlightList';
import type { FC } from 'react';
import { LIST_LABEL, POINTS_TITLE, toSectionMeta } from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';
import { ActsRow } from './ActsRow';

interface ActsListProps {
  hub: ActsHub;
}

export const ActsList: FC<ActsListProps> = ({ hub }) => {
  const items = hub.sections.flatMap((section) => {
    const group = section.group;
    const title = group?.name ?? POINTS_TITLE;
    const media = (
      <KkPictureMark
        image={toImageSource(group?.picture ?? null, 'groupPicture')}
        tone={group?.tone ?? null}
        clubIcon={group?.icon ?? null}
        icon="flag"
        alt={title}
      />
    );

    return [
      <KkSpotlightList.Section
        key={section.id}
        title={title}
        meta={toSectionMeta(section.acts.length)}
        media={media}
      />,
      ...section.acts.map((act) => <ActsRow key={act.actId} act={act} hub={hub} />),
    ];
  });

  return <KkSpotlightList label={LIST_LABEL}>{items}</KkSpotlightList>;
};

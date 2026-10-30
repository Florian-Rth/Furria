import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import type { ActStudioTakes } from '../hooks/use-act-studio-takes';
import { STUDIO_TAKES } from '../studio-copy';

interface ActStudioTakeListProps {
  takes: ActStudioTakes;
}

export const ActStudioTakeList: FC<ActStudioTakeListProps> = ({ takes }) => {
  const groups = takes.groups.flatMap((group) => [
    <KkStudioList.Head key={`head-${group.key}`} text={group.name} aside={group.aside} />,
    ...group.rows.map((row) => (
      <KkStudioList.Row
        key={row.key}
        lead={row.lead}
        title={row.title}
        meta={row.meta}
        badge={row.badge}
        badgeTone={row.badgeTone}
        selected={row.selected}
        label={row.title}
        onPress={row.press}
      />
    )),
  ]);

  return <KkStudioList label={STUDIO_TAKES}>{groups}</KkStudioList>;
};

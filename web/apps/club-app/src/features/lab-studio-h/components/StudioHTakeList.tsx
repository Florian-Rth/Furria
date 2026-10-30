import { KkStudioHList } from '@furria/ui/KkStudioHList';
import type { FC } from 'react';
import type { StudioHTakes } from '../hooks/use-studio-h-takes';
import { STUDIO_H_TAKES } from '../studio-h-copy';

interface StudioHTakeListProps {
  takes: StudioHTakes;
}

export const StudioHTakeList: FC<StudioHTakeListProps> = ({ takes }) => {
  const groups = takes.groups.flatMap((group) => [
    <KkStudioHList.Head key={`head-${group.key}`} text={group.name} aside={group.aside} />,
    ...group.rows.map((row) => (
      <KkStudioHList.Row
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

  return <KkStudioHList label={STUDIO_H_TAKES}>{groups}</KkStudioHList>;
};

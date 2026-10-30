import { KkStudioHList } from '@furria/ui/KkStudioHList';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHCast } from '../hooks/use-studio-h-cast';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import { STUDIO_H_LATER, STUDIO_H_LATER_TITLE, STUDIO_H_SPOTS } from '../studio-h-copy';

interface StudioHCastListProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHCastList: FC<StudioHCastListProps> = ({ h, editor }) => {
  const cast = useStudioHCast(h, editor);
  const rows = cast.map((row) => (
    <KkStudioHList.Row
      key={row.key}
      lead={row.lead}
      title={row.title}
      meta={row.meta}
      badge={row.badge}
      badgeTone="ink"
      selected={row.selected}
      label={row.label}
      onPress={row.press}
    />
  ));

  return (
    <KkStudioHList label={STUDIO_H_SPOTS}>
      <KkStudioHList.Head text={editor.formationText} aside={null} />
      {rows}
      <KkStudioHList.Slot title={STUDIO_H_LATER_TITLE} text={STUDIO_H_LATER} />
    </KkStudioHList>
  );
};

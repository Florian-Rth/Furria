import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import { useActStudioCast } from '../hooks/use-act-studio-cast';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_LATER, STUDIO_LATER_TITLE, STUDIO_SPOTS } from '../studio-copy';

interface ActStudioCastListProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioCastList: FC<ActStudioCastListProps> = ({ screen, editor }) => {
  const cast = useActStudioCast(screen, editor);
  const rows = cast.map((row) => (
    <KkStudioList.Row
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
    <KkStudioList label={STUDIO_SPOTS}>
      <KkStudioList.Head text={editor.formationText} aside={null} />
      {rows}
      <KkStudioList.Slot title={STUDIO_LATER_TITLE} text={STUDIO_LATER} />
    </KkStudioList>
  );
};

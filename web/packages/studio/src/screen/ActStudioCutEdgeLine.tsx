import type { CutDeskLine } from '@furria/studio/cut-desk';
import type { SongDeskNudge } from '@furria/studio/use-song-desk';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC, ReactNode } from 'react';

interface ActStudioCutEdgeLineProps {
  title: string;
  line: CutDeskLine;
}

export const ActStudioCutEdgeLine: FC<ActStudioCutEdgeLineProps> = ({ title, line }) => {
  const nudgeOf = (nudge: SongDeskNudge): ReactNode => (
    <KkStudioDesk.Nudge
      key={nudge.key}
      text={nudge.text}
      label={nudge.label}
      disabled={nudge.disabled}
      onPress={nudge.press}
    />
  );
  const earlier = line.earlier.map(nudgeOf);
  const later = line.later.map(nudgeOf);

  return (
    <KkStudioDesk.Line>
      <KkStudioDesk.Title text={title} />
      <KkStudioDesk.Controls>
        {earlier}
        <KkStudioDesk.Value text={line.valueText} />
        {later}
      </KkStudioDesk.Controls>
    </KkStudioDesk.Line>
  );
};

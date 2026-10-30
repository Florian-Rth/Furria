import { KkStudioIHead } from '@furria/ui/KkStudioIHead';
import type { FC } from 'react';
import type { StudioIHead } from '../hooks/use-studio-i-head';
import { STUDIO_I_NAME_LABEL, STUDIO_I_NOTE_EMPTY, STUDIO_I_NOTE_LABEL } from '../studio-i-copy';

interface StudioIHeadViewProps {
  head: StudioIHead;
}

export const StudioIHeadView: FC<StudioIHeadViewProps> = ({ head }) => {
  if (head.kind === 'music') {
    return (
      <KkStudioIHead>
        <KkStudioIHead.Titles>
          <KkStudioIHead.Eyebrow text={head.eyebrow} />
          <KkStudioIHead.Title text={head.title} />
        </KkStudioIHead.Titles>
      </KkStudioIHead>
    );
  }

  return (
    <KkStudioIHead>
      <KkStudioIHead.Number text={head.number} label={head.numberLabel} />
      <KkStudioIHead.Titles>
        <KkStudioIHead.Eyebrow text={head.eyebrow} />
        <KkStudioIHead.Name value={head.name} label={STUDIO_I_NAME_LABEL} onChange={head.rename} />
        <KkStudioIHead.Note
          value={head.note}
          label={STUDIO_I_NOTE_LABEL}
          placeholder={STUDIO_I_NOTE_EMPTY}
          onChange={head.describe}
        />
      </KkStudioIHead.Titles>
    </KkStudioIHead>
  );
};

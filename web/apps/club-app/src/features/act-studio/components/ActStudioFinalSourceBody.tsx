import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC, ReactNode } from 'react';
import type { FinalSourceDesk } from '../hooks/use-final-desk';
import type { SongDeskNudge } from '../hooks/use-song-desk';
import {
  STUDIO_FINAL_DESK,
  STUDIO_FINAL_FILE,
  STUDIO_FINAL_MATCH,
  STUDIO_FINAL_MATCHING,
  STUDIO_FINAL_PLACE,
  STUDIO_FINAL_START_HERE,
} from '../studio-copy';

interface ActStudioFinalSourceBodyProps {
  desk: FinalSourceDesk;
}

export const ActStudioFinalSourceBody: FC<ActStudioFinalSourceBodyProps> = ({ desk }) => {
  const nudgeOf = (nudge: SongDeskNudge): ReactNode => (
    <KkStudioDesk.Nudge
      key={nudge.key}
      text={nudge.text}
      label={nudge.label}
      disabled={desk.shiftLocked}
      onPress={nudge.press}
    />
  );
  const earlier = desk.earlier.map(nudgeOf);
  const later = desk.later.map(nudgeOf);
  const matchText = desk.matching ? STUDIO_FINAL_MATCHING : STUDIO_FINAL_MATCH;

  return (
    <KkStudioDesk label={STUDIO_FINAL_DESK}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_FINAL_PLACE} />
        <KkStudioDesk.Controls>
          {earlier}
          <KkStudioDesk.Value text={desk.offsetText} />
          {later}
          <KkButton variant="outlined" size="small" onClick={desk.startHere}>
            {STUDIO_FINAL_START_HERE}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_FINAL_FILE} />
        <KkStudioDesk.Controls>
          <KkButton variant="outlined" size="small" disabled={desk.matching} onClick={desk.match}>
            {matchText}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </KkStudioDesk>
  );
};

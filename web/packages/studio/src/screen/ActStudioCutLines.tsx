import { ActStudioCutEdgeLine } from '@furria/studio/ActStudioCutEdgeLine';
import type { CutDesk } from '@furria/studio/cut-desk';
import {
  STUDIO_CUT,
  STUDIO_CUT_END,
  STUDIO_CUT_END_HERE,
  STUDIO_CUT_SPLIT,
  STUDIO_CUT_START,
  STUDIO_CUT_START_HERE,
} from '@furria/studio/studio-copy';
import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC, ReactNode } from 'react';

interface ActStudioCutLinesProps {
  cut: CutDesk;
  children?: ReactNode;
}

export const ActStudioCutLines: FC<ActStudioCutLinesProps> = ({ cut, children }) => (
  <>
    <KkStudioDesk.Line>
      <KkStudioDesk.Title text={STUDIO_CUT} />
      <KkStudioDesk.Controls>
        <KkButton
          variant="outlined"
          size="small"
          disabled={cut.startHere.disabled}
          onClick={cut.startHere.press}
        >
          {STUDIO_CUT_START_HERE}
        </KkButton>
        <KkButton
          variant="outlined"
          size="small"
          disabled={cut.split.disabled}
          onClick={cut.split.press}
        >
          {STUDIO_CUT_SPLIT}
        </KkButton>
        <KkButton
          variant="outlined"
          size="small"
          disabled={cut.endHere.disabled}
          onClick={cut.endHere.press}
        >
          {STUDIO_CUT_END_HERE}
        </KkButton>
        {children}
      </KkStudioDesk.Controls>
    </KkStudioDesk.Line>
    <ActStudioCutEdgeLine title={STUDIO_CUT_START} line={cut.start} />
    <ActStudioCutEdgeLine title={STUDIO_CUT_END} line={cut.end} />
  </>
);

import { KkFocusLayout } from '@furria/ui/KkFocusLayout';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { StudioEveningContext } from '@/features/act-studio/hooks/use-studio-screen';
import { STUDIO_SONG_ACCEPT } from '@/features/act-studio/studio-copy';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { FOCUS_LABEL } from '../focus-copy';
import { useFocusEditor } from '../hooks/use-focus-editor';
import type { FocusMusicTool } from '../schemas';
import { FocusContextBar } from './FocusContextBar';
import { FocusOutlinePane } from './FocusOutlinePane';
import { FocusStagePane } from './FocusStagePane';
import { FocusStrip } from './FocusStrip';
import { FocusTimeline } from './FocusTimeline';
import { FocusTopBar } from './FocusTopBar';

interface FocusBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
  openMusic: (tool: FocusMusicTool) => void;
}

export const FocusBody: FC<FocusBodyProps> = (props) => {
  const editor = useFocusEditor(props);
  const { eveningBand } = editor.screen;
  const band =
    eveningBand === null ? null : (
      <KkStudioView.Band>
        <KkStudioView.BandNote text={eveningBand} />
      </KkStudioView.Band>
    );
  const float =
    editor.desk && editor.screen.studio.spots.length > 0 ? (
      <KkFocusLayout.Float>
        <FocusContextBar editor={editor} />
      </KkFocusLayout.Float>
    ) : null;
  const desk = editor.desk ? (
    <>
      <KkFocusLayout.Outline>
        <FocusOutlinePane editor={editor} />
      </KkFocusLayout.Outline>
      <KkFocusLayout.Time>
        <FocusTimeline editor={editor} />
      </KkFocusLayout.Time>
    </>
  ) : (
    <KkFocusLayout.Strip>
      <FocusStrip editor={editor} />
    </KkFocusLayout.Strip>
  );

  return (
    <KkFocusLayout label={FOCUS_LABEL} kind="editor">
      {band}
      <KkFocusLayout.Top>
        <FocusTopBar editor={editor} />
      </KkFocusLayout.Top>
      <KkFocusLayout.Stage>
        <FocusStagePane editor={editor} />
        {float}
      </KkFocusLayout.Stage>
      {desk}
      <Box
        component="input"
        type="file"
        accept={STUDIO_SONG_ACCEPT}
        multiple
        ref={editor.setup.uploads.fileInput}
        onChange={editor.setup.uploads.onChosen}
        hidden
      />
    </KkFocusLayout>
  );
};

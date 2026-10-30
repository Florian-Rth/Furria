import { KkStudioIEditor } from '@furria/ui/KkStudioIEditor';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { PracticeCountLive } from '@/features/act-practice/components/PracticeCountLive';
import type { Studio } from '@/features/acts/schemas';
import { useStudioIClip } from '../hooks/use-studio-i-clip';
import { useStudioICounts } from '../hooks/use-studio-i-counts';
import { useStudioIDetail } from '../hooks/use-studio-i-detail';
import type { StudioIDrafts } from '../hooks/use-studio-i-drafts';
import { useStudioIEdit } from '../hooks/use-studio-i-edit';
import { useStudioIHead } from '../hooks/use-studio-i-head';
import { useStudioIKeys } from '../hooks/use-studio-i-keys';
import type { StudioIModeState } from '../hooks/use-studio-i-mode';
import { useStudioIOverview } from '../hooks/use-studio-i-overview';
import { useStudioIRail } from '../hooks/use-studio-i-rail';
import { useStudioIStage } from '../hooks/use-studio-i-stage';
import { useStudioISwipe } from '../hooks/use-studio-i-swipe';
import { useStudioITransport } from '../hooks/use-studio-i-transport';
import { useStudioIWave } from '../hooks/use-studio-i-wave';
import { STUDIO_I_EDITOR_LABEL } from '../studio-i-copy';
import { StudioICountsView } from './StudioICountsView';
import { StudioIDetailSheet } from './StudioIDetailSheet';
import { StudioIFrameView } from './StudioIFrameView';
import { StudioIHeadView } from './StudioIHeadView';
import { StudioIRailView } from './StudioIRailView';
import { StudioISideView } from './StudioISideView';
import { StudioITransportView } from './StudioITransportView';
import { StudioIWaveView } from './StudioIWaveView';

interface StudioIEditorProps {
  studio: Studio;
  playback: StudioPlayback;
  drafts: StudioIDrafts;
  mode: StudioIModeState;
}

export const StudioIEditor: FC<StudioIEditorProps> = ({ studio, playback, drafts, mode }) => {
  const edit = useStudioIEdit(playback, drafts, mode);
  const rail = useStudioIRail(studio, playback, drafts, edit);
  const head = useStudioIHead(studio, playback, drafts, edit);
  const wave = useStudioIWave(studio, playback, drafts, edit);
  const stage = useStudioIStage(studio, playback, drafts, edit);
  const counts = useStudioICounts(studio, playback, drafts, edit);
  const clip = useStudioIClip(studio, playback, drafts, edit);
  const detail = useStudioIDetail(studio, playback, drafts, edit, clip);
  const overview = useStudioIOverview(studio, playback);
  const transport = useStudioITransport(playback, edit, drafts.spans.length);
  const swipe = useStudioISwipe(edit.go);
  useStudioIKeys({ transport, clear: edit.clearSelection });

  const side = edit.wide ? (
    <StudioISideView
      onStep={edit.span !== null}
      paned={!edit.sheeted}
      clip={clip}
      detail={detail}
      overview={overview}
    />
  ) : null;
  const sheet = !edit.sheeted ? null : (
    <StudioIDetailSheet
      detail={detail}
      counts={counts}
      transport={transport}
      player={playback.player}
      length={playback.length}
    />
  );
  const count =
    edit.span === null || !edit.wide ? null : (
      <PracticeCountLive player={playback.player} segments={playback.segments} />
    );

  return (
    <KkStudioIEditor label={STUDIO_I_EDITOR_LABEL}>
      <KkStudioIEditor.Head>
        <StudioIHeadView head={head} />
        {count}
      </KkStudioIEditor.Head>
      <KkStudioIEditor.Rail>
        <StudioIRailView rail={rail} />
      </KkStudioIEditor.Rail>
      <KkStudioIEditor.Wave>
        <StudioIWaveView wave={wave} player={playback.player} />
      </KkStudioIEditor.Wave>
      <KkStudioIEditor.Frame>
        <StudioIFrameView
          edit={edit}
          playback={playback}
          stage={stage}
          clip={clip}
          overview={overview}
          swipe={swipe}
        />
      </KkStudioIEditor.Frame>
      <KkStudioIEditor.Counts>
        <StudioICountsView counts={counts} player={playback.player} length={playback.length} />
      </KkStudioIEditor.Counts>
      <KkStudioIEditor.Controls>
        <StudioITransportView transport={transport} />
      </KkStudioIEditor.Controls>
      <KkStudioIEditor.Side>{side}</KkStudioIEditor.Side>
      {sheet}
    </KkStudioIEditor>
  );
};

import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioIDetail } from '@furria/ui/KkStudioIDetail';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioICountsView as CountsModel } from '../hooks/use-studio-i-counts';
import type { StudioIDetailView } from '../hooks/use-studio-i-detail';
import type { StudioITransport } from '../hooks/use-studio-i-transport';
import { STUDIO_I_RESET } from '../studio-i-copy';
import { StudioICountsView } from './StudioICountsView';

interface StudioIDetailSheetProps {
  detail: StudioIDetailView;
  counts: CountsModel;
  transport: StudioITransport;
  player: MixPlayer;
  length: number;
}

export const StudioIDetailSheet: FC<StudioIDetailSheetProps> = ({
  detail,
  counts,
  transport,
  player,
  length,
}) => {
  const close =
    detail.close === null ? null : (
      <KkStudioIDetail.Close label={detail.closeLabel} onClose={detail.close} />
    );
  const reset =
    detail.reset === null || detail.reset.disabled ? null : (
      <KkStudioIDetail.Action
        text={STUDIO_I_RESET}
        disabled={detail.reset.disabled}
        onPress={detail.reset.press}
      />
    );
  const lane =
    detail.kind === 'dot' ? (
      <StudioICountsView counts={counts} player={player} length={length} />
    ) : null;
  const nudge =
    detail.nudge === null ? (
      <KkStudioIDetail.Line text={detail.line} />
    ) : (
      <KkStudioIDetail.Nudge
        label={detail.nudge.label}
        value={detail.nudge.value}
        earlierLabel={detail.nudge.earlierLabel}
        laterLabel={detail.nudge.laterLabel}
        onEarlier={detail.nudge.earlier}
        onLater={detail.nudge.later}
      />
    );

  return (
    <KkStudioIDetail label={detail.label} placement="sheet" open={detail.open}>
      <KkStudioIDetail.Top>
        <KkStudioIDetail.Title eyebrow={detail.eyebrow} title={detail.title} />
        {reset}
        <KkPracticeTransport.Play
          playing={transport.playing}
          label={transport.playLabel}
          disabled={!transport.canPlay}
          onToggle={transport.toggle}
        />
        {close}
      </KkStudioIDetail.Top>
      {lane}
      {nudge}
    </KkStudioIDetail>
  );
};

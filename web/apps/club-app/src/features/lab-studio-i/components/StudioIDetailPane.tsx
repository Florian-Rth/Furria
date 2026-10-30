import { KkStudioIDetail } from '@furria/ui/KkStudioIDetail';
import type { FC } from 'react';
import type { StudioIDetailView } from '../hooks/use-studio-i-detail';
import { STUDIO_I_MORE_SLOT, STUDIO_I_MORE_SOON, STUDIO_I_RESET } from '../studio-i-copy';

interface StudioIDetailPaneProps {
  detail: StudioIDetailView;
}

export const StudioIDetailPane: FC<StudioIDetailPaneProps> = ({ detail }) => {
  const facts = detail.facts.map((fact) => (
    <KkStudioIDetail.Fact key={fact.key} label={fact.label} value={fact.value} tone={fact.tone} />
  ));
  const close =
    detail.close === null ? null : (
      <KkStudioIDetail.Close label={detail.closeLabel} onClose={detail.close} />
    );
  const nudge =
    detail.nudge === null ? null : (
      <KkStudioIDetail.Nudge
        label={detail.nudge.label}
        value={detail.nudge.value}
        earlierLabel={detail.nudge.earlierLabel}
        laterLabel={detail.nudge.laterLabel}
        onEarlier={detail.nudge.earlier}
        onLater={detail.nudge.later}
      />
    );
  const reset =
    detail.reset === null ? null : (
      <KkStudioIDetail.Action
        text={STUDIO_I_RESET}
        disabled={detail.reset.disabled}
        onPress={detail.reset.press}
      />
    );
  const slot = detail.slot ? (
    <KkStudioIDetail.Slot label={STUDIO_I_MORE_SLOT} text={STUDIO_I_MORE_SOON} />
  ) : null;

  return (
    <KkStudioIDetail label={detail.label} placement="pane" open>
      <KkStudioIDetail.Top>
        <KkStudioIDetail.Title eyebrow={detail.eyebrow} title={detail.title} />
        {close}
      </KkStudioIDetail.Top>
      <KkStudioIDetail.Facts>{facts}</KkStudioIDetail.Facts>
      {nudge}
      {reset}
      {slot}
    </KkStudioIDetail>
  );
};

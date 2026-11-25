import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { HALL_BUILDER_HELP_COPY, HALL_BUILDER_HELP_SPOTS } from '../hall-builder-help-copy';
import type { HallBuilderHelpViewer } from '../hooks/use-hall-builder-help-viewer';
import { HallHelpDockPreview } from './HallHelpDockPreview';

interface HallBuilderHelpProps {
  viewer: HallBuilderHelpViewer;
}

export const HallBuilderHelp: FC<HallBuilderHelpProps> = ({ viewer }) => {
  const { isTouch } = viewer;
  const copy = HALL_BUILDER_HELP_COPY;
  const viewText = isTouch ? copy.view.touch : copy.view.desk;
  const drawText = isTouch ? copy.draw.touch : copy.draw.desk;
  const polylineText = isTouch ? copy.draw.polylineTouch : copy.draw.polylineDesk;
  const selectText = isTouch ? copy.select.touch : copy.select.desk;
  const dockPreview = isTouch ? (
    <KkHelp.Preview>
      <HallHelpDockPreview />
    </KkHelp.Preview>
  ) : null;
  const dockShow = isTouch ? <ScreenHelpShow spot={HALL_BUILDER_HELP_SPOTS.tools} /> : null;
  const selectMany = isTouch ? <KkHelp.Text>{copy.select.touchMany}</KkHelp.Text> : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{copy.view.title}</KkHelp.Title>
        <KkHelp.Text>{viewText}</KkHelp.Text>
        <KkHelp.Text>{copy.view.measure}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        {dockPreview}
        <KkHelp.Title>{copy.draw.title}</KkHelp.Title>
        <KkHelp.Text>{drawText}</KkHelp.Text>
        <KkHelp.Text>{polylineText}</KkHelp.Text>
        <KkHelp.Text>{copy.draw.shapes}</KkHelp.Text>
        {dockShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{copy.select.title}</KkHelp.Title>
        <KkHelp.Text>{selectText}</KkHelp.Text>
        {selectMany}
        <KkHelp.Text>{copy.select.merge}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{copy.exits.title}</KkHelp.Title>
        <KkHelp.Text>{copy.exits.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{copy.hall.title}</KkHelp.Title>
        <KkHelp.Text>{copy.hall.text}</KkHelp.Text>
        <KkHelp.Text>{copy.hall.saving}</KkHelp.Text>
        <ScreenHelpShow spot={HALL_BUILDER_HELP_SPOTS.status} />
      </KkHelp.Hint>
    </ScreenHelp>
  );
};

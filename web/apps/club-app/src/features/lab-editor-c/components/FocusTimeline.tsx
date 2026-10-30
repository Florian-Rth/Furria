import { KkFocusLanes } from '@furria/ui/KkFocusLanes';
import { KkFocusOverview } from '@furria/ui/KkFocusOverview';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  FOCUS_LANE_MUSIC,
  FOCUS_LANE_PATHS,
  FOCUS_LANE_STEPS,
  FOCUS_LANE_VIDEO,
  FOCUS_OVERVIEW,
  FOCUS_TIMELINE,
} from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusLanePlayhead } from './FocusLanePlayhead';
import { FocusLaneSetup } from './FocusLaneSetup';
import { FocusOverviewWindow } from './FocusOverviewWindow';
import { FocusTrack } from './FocusTrack';

interface FocusTimelineProps {
  editor: FocusEditor;
}

export const FocusTimeline: FC<FocusTimelineProps> = ({ editor }) => {
  const { lanes, view, setup } = editor;
  const bands = lanes.parts.map((part) => (
    <KkFocusOverview.Band
      key={part.key}
      start={part.start}
      end={part.end}
      name={part.name}
      shade={part.shade}
      current={part.current}
    />
  ));
  const overviewSpans = lanes.spans.map((span) => (
    <KkFocusOverview.Span key={span.key} start={span.start} end={span.end} />
  ));
  const parts = lanes.parts.map((part) => (
    <KkFocusLanes.Part
      key={part.key}
      start={part.start}
      end={part.end}
      name={part.name}
      shade={part.shade}
      current={part.current}
    />
  ));
  const steps = lanes.steps.map((step) => (
    <KkFocusLanes.Step
      key={step.key}
      start={step.start}
      end={step.end}
      number={step.number}
      name={step.name}
      label={step.label}
      current={step.current}
      onPress={step.press}
    />
  ));
  const borders = lanes.borders.map((border) => (
    <KkFocusLanes.Border
      key={border.key}
      share={border.share}
      label={border.label}
      text={border.text}
      active={border.active}
      onMove={border.move}
      onEnd={border.end}
      onNudge={border.nudge}
    />
  ));
  const spans = lanes.spans.map((span) => (
    <KkFocusLanes.Span
      key={span.key}
      start={span.start}
      end={span.end}
      text={span.text}
      label={span.label}
      selected={span.selected}
      onPress={span.press}
      onMove={span.move}
      onEnd={span.finish}
    />
  ));
  const keys = lanes.keys.map((key) => (
    <KkFocusLanes.Key
      key={key.key}
      share={key.share}
      label={key.label}
      moving={key.moving}
      onPress={key.press}
    />
  ));
  const musicMeta = setup.uploading ?? lanes.musicMeta;
  const stepsSetup = setup.actionOf('steps');
  const musicSetup = setup.actionOf('music');
  const videoSetup = setup.actionOf('video');

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkFocusOverview label={FOCUS_OVERVIEW} onAim={view.aim}>
        {bands}
        <KkFocusOverview.Wave bars={lanes.overviewBars} inset="1rem" />
        {overviewSpans}
        <FocusOverviewWindow editor={editor} />
      </KkFocusOverview>
      <KkFocusLanes label={FOCUS_TIMELINE}>
        <KkFocusLanes.Names>
          <KkFocusLanes.Name
            lane="steps"
            glyph="steps"
            text={FOCUS_LANE_STEPS}
            meta={lanes.stepsMeta}
          />
          <KkFocusLanes.Name lane="music" glyph="music" text={FOCUS_LANE_MUSIC} meta={musicMeta} />
          <KkFocusLanes.Name
            lane="video"
            glyph="video"
            text={FOCUS_LANE_VIDEO}
            meta={lanes.videoMeta}
          />
          <KkFocusLanes.Name
            lane="paths"
            glyph="paths"
            text={FOCUS_LANE_PATHS}
            meta={lanes.pathsMeta}
          />
        </KkFocusLanes.Names>
        <KkFocusLanes.View>
          <FocusTrack editor={editor}>
            <KkFocusLanes.Row lane="steps" label={FOCUS_LANE_STEPS}>
              {parts}
              {steps}
              {borders}
            </KkFocusLanes.Row>
            <KkFocusLanes.Row lane="music" label={FOCUS_LANE_MUSIC}>
              <KkFocusLanes.Seek onSeek={view.seekShare} />
              <KkFocusLanes.Wave bars={lanes.bars} inset="0.5rem" />
              <KkFocusLanes.Beats beats={lanes.beats} />
            </KkFocusLanes.Row>
            <KkFocusLanes.Row lane="video" label={FOCUS_LANE_VIDEO}>
              {spans}
            </KkFocusLanes.Row>
            <KkFocusLanes.Row lane="paths" label={FOCUS_LANE_PATHS}>
              {keys}
            </KkFocusLanes.Row>
          </FocusTrack>
          <KkFocusLanes.Over>
            <FocusLaneSetup lane="steps" action={stepsSetup} />
            <FocusLaneSetup lane="music" action={musicSetup} />
            <FocusLaneSetup lane="video" action={videoSetup} />
            <FocusLaneSetup lane="paths" action={null} />
          </KkFocusLanes.Over>
          <FocusLanePlayhead editor={editor} />
        </KkFocusLanes.View>
      </KkFocusLanes>
    </Stack>
  );
};

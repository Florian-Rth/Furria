import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { LaneBorders } from '../hooks/use-lane-borders';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneInspector } from '../hooks/use-lane-inspector';
import { LANE_ACTIONS, LANE_FORMATION } from '../lane-copy';
import { LaneActionRow } from './LaneActionRow';

interface LaneSelectionPaneProps {
  lane: LaneEditor;
  borders: LaneBorders;
}

const NAME_LIMIT = 80;

export const LaneSelectionPane: FC<LaneSelectionPaneProps> = ({ lane, borders }) => {
  const view = useLaneInspector(lane, borders);
  const fields = view.fields.map((field) => (
    <KkLaneInspector.Field
      key={field.key}
      label={field.label}
      value={field.value}
      placeholder={field.placeholder}
      maxLength={NAME_LIMIT}
      onChange={field.change}
      onCommit={field.commit}
    />
  ));
  const note = view.note === null ? null : <KkLaneInspector.Note text={view.note} />;
  const actions =
    view.actions.length === 0 ? null : (
      <LaneActionRow label={LANE_ACTIONS} actions={view.actions} />
    );
  const arrange =
    view.arrange.length === 0 ? null : (
      <>
        <KkLaneInspector.Section text={LANE_FORMATION} />
        <LaneActionRow label={LANE_FORMATION} actions={view.arrange} />
      </>
    );

  return (
    <>
      <KkLaneInspector.Head eyebrow={view.eyebrow} title={view.title} />
      <KkLaneInspector.Facts facts={view.facts} />
      {note}
      {actions}
      {fields}
      {arrange}
    </>
  );
};

import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import { DESK_ACTIONS, DESK_FORMATION_GROUP } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import type { DeskBorders } from '../hooks/use-desk-borders';
import { useDeskInspector } from '../hooks/use-desk-inspector';
import { DeskActionRow } from './DeskActionRow';

interface DeskSelectionPaneProps {
  desk: ActDesk;
  borders: DeskBorders;
}

const NAME_LIMIT = 80;

export const DeskSelectionPane: FC<DeskSelectionPaneProps> = ({ desk, borders }) => {
  const view = useDeskInspector(desk, borders);
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
      <DeskActionRow label={DESK_ACTIONS} actions={view.actions} />
    );
  const arrange =
    view.arrange.length === 0 ? null : (
      <>
        <KkLaneInspector.Section text={DESK_FORMATION_GROUP} />
        <DeskActionRow label={DESK_FORMATION_GROUP} actions={view.arrange} />
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

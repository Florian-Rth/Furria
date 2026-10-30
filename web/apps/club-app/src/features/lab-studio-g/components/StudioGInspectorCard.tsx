import { KkStudioGInspector } from '@furria/ui/KkStudioGInspector';
import type { FC } from 'react';
import {
  INSPECTOR_CHANGED,
  INSPECTOR_CLOSE,
  INSPECTOR_LATER,
  INSPECTOR_TOOLS,
} from '../studio-g-copy';
import type { InspectorModel } from '../studio-g-inspector-model';

interface StudioGInspectorCardProps {
  model: InspectorModel;
  onClose: (() => void) | null;
}

export const StudioGInspectorCard: FC<StudioGInspectorCardProps> = ({ model, onClose }) => {
  const close = onClose ?? undefined;
  const closeLabel = onClose === null ? undefined : INSPECTOR_CLOSE;
  const changed = model.changed ? <KkStudioGInspector.Changed text={INSPECTOR_CHANGED} /> : null;
  const note = model.note === null ? null : <KkStudioGInspector.Note text={model.note} />;
  const hint = model.hint === null ? null : <KkStudioGInspector.Note text={model.hint} />;
  const poster =
    model.poster === null ? null : (
      <KkStudioGInspector.Thumb poster={model.poster} alt={model.title} />
    );
  const facts = model.facts.map((fact) => (
    <KkStudioGInspector.Fact
      key={fact.key}
      label={fact.label}
      value={fact.value}
      tone={fact.tone}
    />
  ));
  const actionButtons = model.actions.map((action) => (
    <KkStudioGInspector.Action
      key={action.key}
      glyph={action.glyph}
      text={action.text}
      label={action.label}
      pressed={action.pressed}
      onPress={action.press}
    />
  ));
  const actions =
    model.actions.length === 0 ? null : (
      <KkStudioGInspector.Row>{actionButtons}</KkStudioGInspector.Row>
    );
  const slotPlaces = model.slots.map((slot) => <KkStudioGInspector.Slot key={slot} text={slot} />);
  const slots =
    model.slots.length === 0 ? null : (
      <>
        <KkStudioGInspector.Eyebrow text={INSPECTOR_TOOLS} />
        <KkStudioGInspector.Slots>
          {slotPlaces}
          <KkStudioGInspector.Later text={INSPECTOR_LATER} />
        </KkStudioGInspector.Slots>
      </>
    );

  return (
    <>
      <KkStudioGInspector.Head
        kind={model.kind}
        eyebrow={model.eyebrow}
        title={model.title}
        closeLabel={closeLabel}
        onClose={close}
      />
      <KkStudioGInspector.Body>
        {changed}
        <KkStudioGInspector.Facts>{facts}</KkStudioGInspector.Facts>
        {actions}
        {note}
        {poster}
        {hint}
        {slots}
      </KkStudioGInspector.Body>
    </>
  );
};

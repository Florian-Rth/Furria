import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { toInitials } from '@/lib/initials';
import {
  ADD_GUEST_LABEL,
  ADD_PERSON_LABEL,
  CAST_LABEL,
  CAST_TITLE,
  GUEST_BADGE,
  MEMBERS_LOADING,
  toCastTallyLine,
  toShortName,
  toTileStateLabel,
} from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';
import { ActGuestPicker } from './ActGuestPicker';

interface ActCastSectionProps {
  editor: ActEditor;
}

export const ActCastSection: FC<ActCastSectionProps> = ({ editor }) => {
  const tiles: KkCastTile[] = editor.tiles.map(({ person, state }) => ({
    id: person.personId,
    name: toShortName(person.firstName, person.lastName),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait, 'portrait'),
    state,
    badge: state === 'guest' ? GUEST_BADGE : null,
    stateLabel: toTileStateLabel(state),
  }));
  const meta = toCastTallyLine(editor.tally, editor.grouped);
  const addLabel = editor.grouped ? ADD_GUEST_LABEL : ADD_PERSON_LABEL;
  const loading = editor.membersLoading ? <KkMeta>{MEMBERS_LOADING}</KkMeta> : null;
  const picker = editor.isAdding ? <ActGuestPicker editor={editor} /> : null;

  const metaLine = <KkMeta>{meta}</KkMeta>;

  return (
    <PlannerDetailSection title={CAST_TITLE} action={metaLine}>
      {loading}
      <KkCastGrid
        label={CAST_LABEL}
        tiles={tiles}
        addLabel={addLabel}
        onToggle={editor.toggleCast}
        onAdd={editor.openAdding}
      />
      {picker}
    </PlannerDetailSection>
  );
};

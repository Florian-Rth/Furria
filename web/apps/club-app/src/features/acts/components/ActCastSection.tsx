import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { CAST_LABEL, CAST_TITLE, MEMBERS_LOADING, toCastCountLine } from '../acts-copy';
import { readOnlyCastTilesOf } from '../cast-tiles';
import type { ActEditor } from '../hooks/use-act-editor';

interface ActCastSectionProps {
  editor: ActEditor;
}

const ignoreToggle = (): void => undefined;

export const ActCastSection: FC<ActCastSectionProps> = ({ editor }) => {
  const tiles = readOnlyCastTilesOf(editor.members);
  const countLine = editor.members === null ? null : toCastCountLine(editor.members.length);
  const metaLine = countLine === null ? undefined : <KkMeta>{countLine}</KkMeta>;
  const loading = editor.membersLoading ? <KkMeta>{MEMBERS_LOADING}</KkMeta> : null;

  return (
    <PlannerDetailSection title={CAST_TITLE} action={metaLine}>
      {loading}
      <KkCastGrid label={CAST_LABEL} tiles={tiles} onToggle={ignoreToggle} readOnly />
    </PlannerDetailSection>
  );
};

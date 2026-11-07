import { EJ_VERSIONS_LOADING, EJ_VERSIONS_NOTE } from '@furria/studio/edit-jobs-copy';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EditorVersions } from '../hooks/use-editor-versions';
import { VERSIONS_EMPTY, VERSIONS_FAILED } from '../undo-copy';
import { EditorVersionRow } from './EditorVersionRow';

interface EditorVersionsSectionProps {
  versions: EditorVersions;
}

const stateNoteOf = (versions: EditorVersions): string | null => {
  if (versions.state === 'failed') {
    return VERSIONS_FAILED;
  }
  if (versions.state === 'loading') {
    return EJ_VERSIONS_LOADING;
  }

  return versions.rows.length === 0 ? VERSIONS_EMPTY : null;
};

export const EditorVersionsSection: FC<EditorVersionsSectionProps> = ({ versions }) => {
  const rows = versions.rows.map((row) => (
    <EditorVersionRow key={row.key} row={row} busy={versions.restoring} />
  ));
  const stateText = stateNoteOf(versions);
  const stateNote = stateText === null ? null : <KkEjPanel.Note text={stateText} />;
  const older =
    versions.olderText === null ? null : (
      <KkEjButton
        text={versions.olderText}
        glyph="history"
        disabled={versions.loadingOlder}
        onPress={versions.loadOlder}
      />
    );

  return (
    <KkEjPanel.Group label={versions.title}>
      <KkEjPanel.GroupHead text={versions.title} aside={null} />
      <KkEjPanel.Note text={EJ_VERSIONS_NOTE} />
      {stateNote}
      {rows}
      {older}
    </KkEjPanel.Group>
  );
};

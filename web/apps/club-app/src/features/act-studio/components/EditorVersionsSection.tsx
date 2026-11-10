import { JOB_VERSIONS_LOADING } from '@furria/studio/job-copy';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkPillButton } from '@furria/ui/KkPillButton';
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
    return JOB_VERSIONS_LOADING;
  }

  return versions.rows.length === 0 ? VERSIONS_EMPTY : null;
};

export const EditorVersionsSection: FC<EditorVersionsSectionProps> = ({ versions }) => {
  const rows = versions.rows.map((row) => (
    <EditorVersionRow key={row.key} row={row} busy={versions.restoring} />
  ));
  const stateText = stateNoteOf(versions);
  const stateNote = stateText === null ? null : <KkJobPanel.Note text={stateText} />;
  const older =
    versions.olderText === null ? null : (
      <KkPillButton
        text={versions.olderText}
        glyph="history"
        disabled={versions.loadingOlder}
        onPress={versions.loadOlder}
      />
    );

  return (
    <KkJobPanel.Group label={versions.title}>
      <KkJobPanel.GroupHead text={versions.title} aside={null} />
      {stateNote}
      {rows}
      {older}
    </KkJobPanel.Group>
  );
};

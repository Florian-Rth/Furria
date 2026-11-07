import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import { VERSIONS_EMPTY, VERSIONS_FAILED } from '@/features/act-studio/undo-copy';
import { EJ_VERSIONS_LOADING, EJ_VERSIONS_NOTE } from '../edit-jobs-copy';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjVersionRow } from './EjVersionRow';

interface EjVersionsSectionProps {
  versions: EjVersions;
}

const stateNoteOf = (versions: EjVersions): string | null => {
  if (versions.state === 'failed') {
    return VERSIONS_FAILED;
  }
  if (versions.state === 'loading') {
    return EJ_VERSIONS_LOADING;
  }

  return versions.rows.length === 0 ? VERSIONS_EMPTY : null;
};

export const EjVersionsSection: FC<EjVersionsSectionProps> = ({ versions }) => {
  const rows = versions.rows.map((row) => (
    <EjVersionRow key={row.key} row={row} busy={versions.restoring} />
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

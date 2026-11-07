import type { SaveStatus } from '@furria/studio/autosave';
import { SAVE_STATUS_SHORT, SAVE_STATUS_TEXT } from '@furria/studio/document-copy';
import {
  EJ_DONE,
  EJ_DONE_LABEL,
  EJ_HEAD,
  EJ_MENU,
  EJ_REDO,
  EJ_UNDO,
} from '@furria/studio/edit-jobs-copy';
import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkEjButton } from '@furria/ui/KkEjButton';
import type { KkEjGlyphName } from '@furria/ui/KkEjGlyph';
import { KkEjPhoneHead } from '@furria/ui/KkEjPhoneHead';
import type { FC } from 'react';

interface JobPhoneHeadProps {
  ej: JobPhone;
  title: string;
}

const STATUS_GLYPH: Record<SaveStatus, KkEjGlyphName> = {
  saved: 'check',
  saving: 'history',
  failed: 'redo',
};

export const JobPhoneHead: FC<JobPhoneHeadProps> = ({ ej, title }) => {
  const { history, mode } = ej.screen;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const menuOpen = ej.drawer === 'menu';
  const openMenu = (): void => {
    ej.open('menu');
  };
  const status = history.status;
  const statusLine =
    status === null ? null : (
      <KkEjPhoneHead.Status
        text={SAVE_STATUS_SHORT[status]}
        label={SAVE_STATUS_TEXT[status]}
        glyph={STATUS_GLYPH[status]}
        tone={status === 'failed' ? 'danger' : 'quiet'}
      />
    );
  const retry =
    status === 'failed' ? <StudioSaveButton history={history} textShown={false} /> : null;

  return (
    <KkEjPhoneHead label={EJ_HEAD}>
      <KkEjPhoneHead.Name>
        <KkEjPhoneHead.Title text={title} />
        {statusLine}
      </KkEjPhoneHead.Name>
      {retry}
      <KkEjButton
        text={EJ_UNDO}
        glyph="undo"
        textShown={false}
        disabled={undoLocked}
        onPress={history.undo}
      />
      <KkEjButton
        text={EJ_REDO}
        glyph="redo"
        textShown={false}
        disabled={redoLocked}
        onPress={history.redo}
      />
      <KkEjButton
        text={EJ_MENU}
        glyph="more"
        pressed={menuOpen}
        textShown={false}
        onPress={openMenu}
      />
      <KkEjButton text={EJ_DONE} tone="accent" label={EJ_DONE_LABEL} onPress={mode.toggle} />
    </KkEjPhoneHead>
  );
};

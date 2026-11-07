import type { SaveStatus } from '@furria/studio/autosave';
import { SAVE_STATUS_SHORT, SAVE_STATUS_TEXT } from '@furria/studio/document-copy';
import {
  JOB_DONE,
  JOB_DONE_LABEL,
  JOB_HEAD,
  JOB_MENU,
  JOB_REDO,
  JOB_UNDO,
} from '@furria/studio/job-copy';
import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkEditorHead } from '@furria/ui/KkEditorHead';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobPhoneHeadProps {
  jobPhone: JobPhone;
  title: string;
}

const STATUS_GLYPH: Record<SaveStatus, KkLaneGlyphName> = {
  saved: 'check',
  saving: 'history',
  failed: 'redo',
};

export const JobPhoneHead: FC<JobPhoneHeadProps> = ({ jobPhone, title }) => {
  const { history, mode } = jobPhone.screen;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const menuOpen = jobPhone.drawer === 'menu';
  const openMenu = (): void => {
    jobPhone.open('menu');
  };
  const status = history.status;
  const statusLine =
    status === null ? null : (
      <KkEditorHead.Status
        text={SAVE_STATUS_SHORT[status]}
        label={SAVE_STATUS_TEXT[status]}
        glyph={STATUS_GLYPH[status]}
        tone={status === 'failed' ? 'danger' : 'quiet'}
      />
    );
  const retry =
    status === 'failed' ? <StudioSaveButton history={history} textShown={false} /> : null;

  return (
    <KkEditorHead label={JOB_HEAD}>
      <KkEditorHead.Name>
        <KkEditorHead.Title text={title} />
        {statusLine}
      </KkEditorHead.Name>
      {retry}
      <KkPillButton
        text={JOB_UNDO}
        glyph="undo"
        textShown={false}
        disabled={undoLocked}
        onPress={history.undo}
      />
      <KkPillButton
        text={JOB_REDO}
        glyph="redo"
        textShown={false}
        disabled={redoLocked}
        onPress={history.redo}
      />
      <KkPillButton
        text={JOB_MENU}
        glyph="more"
        pressed={menuOpen}
        textShown={false}
        onPress={openMenu}
      />
      <KkPillButton text={JOB_DONE} tone="accent" label={JOB_DONE_LABEL} onPress={mode.toggle} />
    </KkEditorHead>
  );
};
